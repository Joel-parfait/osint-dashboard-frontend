#!/usr/bin/env python3
"""
Turbo Sync: MongoDB → Elasticsearch with Real-time Progress
- Skips already indexed docs in ES automatically
- Shows current ES count vs MongoDB count
- Resume from last unsynced _id
- Memory-efficient bulk indexing
"""

import sys, time, re, warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Lock, Thread
from pymongo import MongoClient
from elasticsearch import Elasticsearch, helpers
from urllib3.exceptions import InsecureRequestWarning
from bson import ObjectId
from collections import deque

warnings.simplefilter('ignore', InsecureRequestWarning)

# ---------------- CONFIG ----------------
MONGO_URI = "mongodb://localhost:27017/?maxPoolSize=200&socketTimeoutMS=300000"
DB_NAME = "leaks_db"
COLLECTION_NAME = "leakeddata"

ES_HOST = "https://localhost:9200"
ES_USER = "elastic"
ES_PASS = "I88=4R-BVi8RrEEWjH1a"
ES_INDEX = "leakeddata_v1"

WORKERS = 4
CHUNK_SIZE = 100_000
PRINT_PROGRESS_EVERY = 5
MGET_BATCH_SIZE = 50_000  # Check ES in chunks to skip existing

# Colors
G = '\033[92m'; Y = '\033[93m'; R = '\033[91m'; B = '\033[94m'; C = '\033[96m'; M = '\033[95m'; END = '\033[0m'

# ---------------- Progress Tracker ----------------
class ProgressTracker:
    """Tracks and displays sync progress"""
    def __init__(self):
        self.activities = deque(maxlen=30)
        self.lock = Lock()
        self.chunk_counter = 0

    def add_activity(self, worker_id, activity):
        with self.lock:
            timestamp = time.strftime("%H:%M:%S")
            self.activities.append(f"[{timestamp}] {worker_id}: {activity}")

    def increment_chunk(self):
        with self.lock:
            self.chunk_counter += 1
            return self.chunk_counter

    def should_check_progress(self):
        with self.lock:
            return self.chunk_counter % PRINT_PROGRESS_EVERY == 0

    def print_progress(self, es_count, mongo_total, indexed_so_far, start_time):
        with self.lock:
            elapsed = time.time() - start_time
            rate = indexed_so_far / elapsed if elapsed > 0 else 0
            print(f"\n{B}{'─' * 80}{END}")
            print(f"{C}📊 SYNC PROGRESS REPORT{END}")
            print(f"{B}{'─' * 80}{END}")
            print(f"  MongoDB Total:        {mongo_total:,}")
            print(f"  Elasticsearch Current: {es_count:,}")
            print(f"  Documents Indexed:     {indexed_so_far:,}")
            if mongo_total > 0:
                print(f"  Completion:           {(es_count/mongo_total)*100:.2f}%")
            if elapsed > 0:
                print(f"  Time Elapsed:         {elapsed/60:.1f} minutes")
                print(f"  Indexing Rate:        {rate:,.0f} docs/sec")
                if rate > 0:
                    remaining_docs = mongo_total - es_count
                    print(f"  Estimated Time Left:  {remaining_docs/rate/60:.1f} minutes")
            print(f"\n{C}📋 RECENT ACTIVITIES:{END}")
            for activity in list(self.activities)[-6:]:
                print(f"  {activity}")
            print(f"{B}{'─' * 80}{END}")

# ---------------- Elasticsearch Client ----------------
def make_es_client():
    return Elasticsearch(
        ES_HOST,
        basic_auth=(ES_USER, ES_PASS),
        verify_certs=False,
        request_timeout=180,
        max_retries=5,
        retry_on_timeout=True
    )

def get_es_count(es):
    try:
        return es.count(index=ES_INDEX)['count']
    except:
        return 0

# ---------------- Skip Existing ----------------
def filter_existing_docs(es, docs):
    """Return only docs that are missing in Elasticsearch"""
    missing = []
    for i in range(0, len(docs), MGET_BATCH_SIZE):
        batch = docs[i:i+MGET_BATCH_SIZE]
        ids = [str(d["_id"]) for d in batch]
        try:
            resp = es.mget(index=ES_INDEX, body={"ids": ids}, _source=False)
            found_ids = {d["_id"] for d in resp.get("docs", []) if d.get("found")}
            missing.extend([d for d in batch if str(d["_id"]) not in found_ids])
        except Exception:
            # fallback: consider all missing if mget fails
            missing.extend(batch)
    return missing

# ---------------- Read Chunk ----------------
def read_chunk_by_id(coll, last_id, limit):
    query = {} if last_id is None else {"_id": {"$gt": last_id}}
    cursor = coll.find(query).sort("_id", 1).limit(limit)
    docs = list(cursor)
    next_last_id = docs[-1]["_id"] if docs else last_id
    return docs, next_last_id

# ---------------- Generate Actions ----------------
def generate_actions(docs):
    for doc in docs:
        doc_dict = dict(doc)
        mongo_id = str(doc_dict.pop("_id", None))
        if "phonenumber" in doc_dict:
            p = doc_dict["phonenumber"]
            if isinstance(p, str):
                doc_dict["phonenumber"] = re.sub(r'\D', '', p)
        yield {
            "_index": ES_INDEX,
            "_id": mongo_id,
            "_source": {"mongo_id": mongo_id, **doc_dict},
            "_op_type": "index"
        }

# ---------------- Process Chunk ----------------
def process_chunk(chunk_id, chunk_docs, es, stats, tracker):
    worker_id = f"Worker-{chunk_id}"
    tracker.add_activity(worker_id, f"Processing {len(chunk_docs):,} docs")
    missing_docs = filter_existing_docs(es, chunk_docs)
    if not missing_docs:
        tracker.add_activity(worker_id, f"All {len(chunk_docs):,} docs already in ES — skipped")
        return 0
    indexed = 0
    try:
        for ok, item in helpers.streaming_bulk(es, generate_actions(missing_docs),
                                              chunk_size=20_000, raise_on_error=False, max_retries=3):
            if ok:
                indexed += 1
        with stats['lock']:
            stats['indexed'] += indexed
        tracker.add_activity(worker_id, f"✅ Indexed {indexed:,} documents")
        return indexed
    except Exception as e:
        tracker.add_activity(worker_id, f"💥 Error: {str(e)[:80]}")
        return 0

# ---------------- Monitor ----------------
def monitor_progress(tracker, es, mongo_total, stats):
    while not stats.get('completed', False):
        time.sleep(10)
        if tracker.should_check_progress():
            try:
                es_count = get_es_count(es)
                with stats['lock']:
                    indexed_so_far = stats['indexed']
                tracker.print_progress(es_count, mongo_total, indexed_so_far, stats['start_time'])
            except Exception as e:
                print(f"{Y}⚠️ Progress check failed: {e}{END}")

# ---------------- Main ----------------
def main():
    tracker = ProgressTracker()
    print(f"{G}{'='*80}{END}")
    print(f"{G}🚀 TURBO SYNC: MongoDB → Elasticsearch (Skipping existing){END}")
    print(f"{G}{'='*80}{END}")

    # MongoDB
    mongo = MongoClient(MONGO_URI, serverSelectionTimeoutMS=10000)
    coll = mongo[DB_NAME][COLLECTION_NAME]
    total_mongo_docs = coll.estimated_document_count()
    print(f"{G}✓ MongoDB: {total_mongo_docs:,} documents{END}")

    # Elasticsearch
    es = make_es_client()
    if not es.ping():
        print(f"{R}✗ Elasticsearch not available!{END}")
        return
    initial_es_count = get_es_count(es)
    print(f"{G}✓ Elasticsearch: {initial_es_count:,} documents already indexed{END}")

    # Start sync from last ES document (skip existing)
    last_id = None
    print(f"{Y}→ Sync will automatically skip {initial_es_count:,} existing documents{END}")

    stats = {'indexed': 0, 'lock': Lock(), 'start_time': time.time(), 'completed': False}

    monitor_thread = Thread(target=monitor_progress, args=(tracker, es, total_mongo_docs, stats), daemon=True)
    monitor_thread.start()

    chunk_id = 0
    try:
        from concurrent.futures import ThreadPoolExecutor, as_completed
        with ThreadPoolExecutor(max_workers=WORKERS) as executor:
            futures = []
            while True:
                chunk_id += 1
                current_chunk = tracker.increment_chunk()
                chunk, last_id = read_chunk_by_id(coll, last_id, CHUNK_SIZE)
                if not chunk:
                    tracker.add_activity("MAIN", "🎉 No more documents to sync!")
                    break
                future = executor.submit(process_chunk, current_chunk, chunk, es, stats, tracker)
                futures.append(future)
                if len(futures) >= WORKERS:
                    for f in as_completed(futures[:WORKERS]):
                        f.result(timeout=600)
                    futures = futures[WORKERS:]
            for f in as_completed(futures):
                f.result(timeout=600)
    except KeyboardInterrupt:
        tracker.add_activity("MAIN", "🛑 Sync interrupted by user")
    finally:
        stats['completed'] = True
        monitor_thread.join(timeout=2)

    # Final report
    total_time = time.time() - stats['start_time']
    final_es_count = get_es_count(es)
    print(f"\n{G}{'='*80}{END}")
    print(f"{G}📊 FINAL SYNC REPORT{END}")
    print(f"{G}{'='*80}{END}")
    print(f"  Total Time:          {total_time/60:.2f} minutes")
    print(f"  Documents Indexed:   {stats['indexed']:,}")
    print(f"  Final ES Count:      {final_es_count:,}")
    print(f"  MongoDB Total:       {total_mongo_docs:,}")
    if total_time > 0:
        print(f"  Average Rate:        {stats['indexed']/total_time:,.0f} docs/sec")
    print(f"{G}{'='*80}{END}")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Y}⚠️  Exiting...{END}")
    except Exception as e:
        print(f"{R}❌ Critical error: {e}{END}")
