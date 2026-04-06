from pymongo import MongoClient, UpdateOne
import time
import threading
import sys

client = MongoClient("mongodb://localhost:27017", maxPoolSize=50)
collection = client["leaks_db"]["leakeddata"]

print("\n" + "⚡" * 50)
print("🚀 ULTRA-FAST NAME CAPITALIZER")
print("📢 Skips already uppercase names")
print("⚡" * 50 + "\n")

# Start timer IMMEDIATELY
start = time.time()
total_processed = 0
total_skipped = 0

print("🔍 Fetching first names to show immediate feedback...")

# Get first 10 documents with names (skip null/empty)
first_names_cursor = collection.find(
    {"name": {"$exists": True, "$ne": None, "$ne": ""}}, 
    {"_id": 1, "name": 1}
).limit(10)

first_docs = list(first_names_cursor)

print(f"📊 Ready to process. Found initial batch of {len(first_docs)} names\n")
print("=" * 60)
print("STARTING PROCESSING...\n")

# Helper function to check if already uppercase
def is_uppercase(name):
    """Check if a string is already in uppercase"""
    return name == name.upper()

# Process first batch immediately for instant feedback
print("✨ FIRST TRANSFORMATIONS:")
for idx, doc in enumerate(first_docs, 1):
    if 'name' in doc and doc['name']:
        original = doc['name']
        
        # Skip if already uppercase
        if is_uppercase(original):
            print(f"{idx}. SKIPPED (already uppercase): {original}")
            total_skipped += 1
            continue
            
        new_name = original.upper()
        total_processed += 1
        
        # Show IMMEDIATELY
        print(f"{idx}. {original} → {new_name}")
        
        # Update immediately
        collection.update_one(
            {"_id": doc["_id"]},
            {"$set": {"name": new_name}}
        )

print(f"\n✅ First batch done in {time.time() - start:.2f} seconds!")
print(f"📊 Stats: Processed: {total_processed} | Skipped: {total_skipped}")

# Now process the rest with OPTIMIZED bulk operations
def process_all_names():
    global total_processed, total_skipped
    
    print("\n" + "🚀" * 30)
    print("⚡ STARTING MASS PROCESSING...")
    print("🚀" * 30 + "\n")
    
    # OPTIMIZATION 1: Only process names that are NOT already uppercase
    # OPTIMIZATION 2: Use efficient regex to filter mixed/lowercase names
    cursor = collection.find(
        {
            "name": {
                "$exists": True,
                "$ne": None,
                "$ne": "",
                "$regex": "[a-z]",  # Only names with lowercase letters
                "$not": {"$regex": "^[A-Z0-9\\s]+$"}  # Not already all uppercase
            }
        },
        {"_id": 1, "name": 1},
        no_cursor_timeout=True,
        batch_size=50000  # Larger batch for efficiency
    )
    
    operations = []
    batch_size = 5000  # Process in large batches
    batch_counter = 0
    last_progress_time = time.time()
    
    try:
        for doc in cursor:
            if 'name' in doc and doc['name']:
                original = doc['name']
                
                # Double-check if already uppercase (regex might miss some edge cases)
                if is_uppercase(original):
                    total_skipped += 1
                    continue
                
                new_name = original.upper()
                total_processed += 1
                
                # Show every 500th transformation for feedback
                if total_processed % 500 == 0:
                    print(f"{total_processed:,}. {original[:30]}... → {new_name[:30]}...")
                
                # Add to batch operation
                operations.append(
                    UpdateOne(
                        {"_id": doc["_id"]},
                        {"$set": {"name": new_name}}
                    )
                )
                
                # Execute batch when full
                if len(operations) >= batch_size:
                    collection.bulk_write(operations, ordered=False)
                    operations = []
                    batch_counter += 1
                    
                    # Show progress stats
                    current_time = time.time()
                    elapsed = current_time - start
                    speed = total_processed / elapsed
                    
                    if current_time - last_progress_time >= 2:  # Every 2 seconds
                        print(f"\n📊 Batch {batch_counter}: {total_processed:,} processed | {total_skipped:,} skipped")
                        print(f"⚡ Speed: {speed:,.0f} names/sec")
                        print(f"⏱ Running: {elapsed:.0f}s")
                        print("-" * 50)
                        last_progress_time = current_time
    
    finally:
        cursor.close()
        
        # Process any remaining operations
        if operations:
            collection.bulk_write(operations, ordered=False)
        
        print(f"\n✅ Background processing complete!")

# Start background processing with MULTIPLE THREADS for maximum speed
def threaded_worker(worker_id, skip, limit):
    """Worker thread to process a segment of data"""
    global total_processed, total_skipped
    
    thread_start = time.time()
    local_processed = 0
    local_skipped = 0
    
    cursor = collection.find(
        {
            "name": {
                "$exists": True,
                "$ne": None,
                "$ne": "",
                "$regex": "[a-z]",
                "$not": {"$regex": "^[A-Z0-9\\s]+$"}
            }
        },
        {"_id": 1, "name": 1},
        skip=skip,
        limit=limit,
        no_cursor_timeout=True,
        batch_size=20000
    )
    
    operations = []
    batch_size = 2000
    
    try:
        for doc in cursor:
            if 'name' in doc and doc['name']:
                original = doc['name']
                
                if is_uppercase(original):
                    local_skipped += 1
                    total_skipped += 1
                    continue
                
                new_name = original.upper()
                local_processed += 1
                total_processed += 1
                
                # Add to batch
                operations.append(
                    UpdateOne(
                        {"_id": doc["_id"]},
                        {"$set": {"name": new_name}}
                    )
                )
                
                # Execute batch
                if len(operations) >= batch_size:
                    collection.bulk_write(operations, ordered=False)
                    operations = []
    
    finally:
        cursor.close()
        if operations:
            collection.bulk_write(operations, ordered=False)
        
        thread_time = time.time() - thread_start
        print(f"👷 Worker {worker_id}: Processed {local_processed:,}, Skipped {local_skipped:,} in {thread_time:.1f}s")

# Get total count of names that need processing (approximate)
print("\n📊 Analyzing database for optimization...")
total_to_check = collection.count_documents({"name": {"$exists": True, "$ne": None, "$ne": ""}})
print(f"🔍 Total names in database: {total_to_check:,}")

# Estimate how many need capitalization
sample = list(collection.aggregate([
    {"$match": {"name": {"$exists": True, "$ne": None, "$ne": ""}}},
    {"$sample": {"size": 1000}},
    {"$project": {"name": 1}}
]))

needs_capitalization = 0
for doc in sample:
    if 'name' in doc and doc['name'] and not is_uppercase(doc['name']):
        needs_capitalization += 1

percentage = (needs_capitalization / len(sample)) * 100 if sample else 0
print(f"📈 Estimated {percentage:.1f}% need capitalization (~{int(total_to_check * percentage/100):,} names)")
print(f"🎯 Will skip ~{int(total_to_check * (100-percentage)/100):,} already uppercase names")

print("\n" + "🚀" * 30)
print("⚡ STARTING PARALLEL PROCESSING...")
print("🚀" * 30 + "\n")

# Use single thread for simplicity, or multi-thread for speed
use_multithreading = False  # Set to True for maximum speed

if use_multithreading:
    # MULTI-THREADED VERSION (FASTER)
    num_threads = 4
    chunk_size = total_to_check // num_threads
    threads = []
    
    for t in range(num_threads):
        skip = t * chunk_size
        limit = chunk_size if t < num_threads - 1 else total_to_check - skip
        thread = threading.Thread(target=threaded_worker, args=(t+1, skip, limit))
        thread.daemon = True
        threads.append(thread)
        thread.start()
    
    # Monitor progress
    print("👥 Running with multiple threads for maximum speed...")
else:
    # SINGLE-THREADED VERSION (Simpler)
    print("👤 Running with single optimized thread...")
    process_all_names()

# Keep main thread alive and show live stats
print("\n📈 LIVE PROGRESS MONITOR:")
print("-" * 60)

last_display = start
try:
    while True:
        current_time = time.time()
        elapsed = current_time - start
        
        # Update display every 1 second
        if current_time - last_display >= 1:
            speed = total_processed / elapsed if elapsed > 0 else 0
            estimated_remaining = (total_to_check * percentage/100 - total_processed) / speed if speed > 0 else 0
            
            # Clear line and print stats
            sys.stdout.write('\r' + ' ' * 100 + '\r')
            sys.stdout.write(f"⏱ [{elapsed:.0f}s] 📊 Processed: {total_processed:,} | Skipped: {total_skipped:,} ")
            sys.stdout.write(f"| ⚡ {speed:,.0f}/sec | ⏰ ETA: {estimated_remaining/60:.1f}min")
            sys.stdout.flush()
            
            last_display = current_time
        
        # Check if processing might be done
        if total_processed > 0 and speed < 100 and elapsed > 30:  # If speed drops very low
            # Do a quick check if we're done
            remaining_check = collection.count_documents({
                "name": {
                    "$exists": True,
                    "$ne": None,
                    "$ne": "",
                    "$regex": "[a-z]",
                    "$not": {"$regex": "^[A-Z0-9\\s]+$"}
                }
            })
            
            if remaining_check == 0:
                print(f"\n\n✅ No more names need capitalization!")
                break
        
        time.sleep(0.5)
        
except KeyboardInterrupt:
    print("\n\n⚠️ Processing interrupted by user!")

end = time.time()
total_time = end - start

print("\n" + "=" * 60)
print("🎉 PROCESSING COMPLETE!")
print("=" * 60)

print(f"\n📊 FINAL STATISTICS:")
print(f"   • Total processing time: {total_time:.2f} seconds ({total_time/60:.1f} minutes)")
print(f"   • Names capitalized: {total_processed:,}")
print(f"   • Names skipped (already uppercase): {total_skipped:,}")
print(f"   • Average speed: {total_processed/total_time:,.0f} names/second")

# Quick verification
print(f"\n🔍 VERIFICATION (random samples):")
samples = collection.aggregate([
    {"$match": {"name": {"$exists": True, "$ne": None, "$ne": ""}}},
    {"$sample": {"size": 5}},
    {"$project": {"name": 1}}
])

for i, doc in enumerate(samples, 1):
    name = doc.get('name', '')
    status = "✅ UPPERCASE" if is_uppercase(name) else "⚠️ Not uppercase"
    print(f"   {i}. {name} - {status}")

print(f"\n🏁 All done! Database optimized.")