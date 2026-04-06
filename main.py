from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from bson import ObjectId
import re
from datetime import datetime

# --------------------------------------
# APP INITIALIZATION
# --------------------------------------
app = FastAPI(title="OSINT Search API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# --------------------------------------
# DATABASE (Repository Layer)
# --------------------------------------
client = MongoClient("mongodb://localhost:27017")
db = client["leaks_db"]
leakeddata = db["leakeddata"]

# --------------------------------------
# SERVICE LAYER HELPERS
# --------------------------------------
def normalize_phone(phone):
    if not phone:
        return ""
    phone = str(phone).strip()
    normalized = re.sub(r'[^\d+]', '', phone)
    if normalized.startswith('+'):
        normalized = normalized[1:]
    if normalized.startswith('0'):
        normalized = normalized[1:]
    return normalized


# --------------------------------------
# SERVICE LAYER (Business Logic)
# --------------------------------------
class PersonService:

    @staticmethod
    def search_by_name(name: str):
        query = {"name": {"$regex": f".*{re.escape(name)}.*", "$options": "i"}}
        return PersonService._execute_query(query)

    @staticmethod
    def search_by_phone(phone: str):
        normalized = normalize_phone(phone)
        regex = f".*{re.escape(normalized)}.*"
        query = {"phonenumber": {"$regex": regex, "$options": "i"}}
        return PersonService._execute_query(query)

    @staticmethod
    def search_by_email(email: str):
        query = {"email": email}
        return PersonService._execute_query(query)

    @staticmethod
    def search_by_address(address: str):
        query = {"address1": {"$regex": f".*{re.escape(address)}.*", "$options": "i"}}
        return PersonService._execute_query(query)

    @staticmethod
    def get_record(record_id: str):
        if not ObjectId.is_valid(record_id):
            raise HTTPException(400, "Invalid ID format")

        record = leakeddata.find_one({"_id": ObjectId(record_id)})
        if not record:
            raise HTTPException(404, "Record not found")

        record["_id"] = str(record["_id"])
        return record

    @staticmethod
    def _execute_query(query: dict, limit: int = 5000):
        cursor = leakeddata.find(query).limit(limit)
        results = []

        for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)

        return results


# --------------------------------------
# CONTROLLER LAYER (Spring Boot Style Endpoints)
# --------------------------------------
@app.get("/")
def root():
    return {"status": "API running", "version": "1.0", "time": datetime.now().isoformat()}


@app.get("/search/name")
def search_name(value: str):
    return PersonService.search_by_name(value)


@app.get("/search/phone")
def search_phone(value: str):
    return PersonService.search_by_phone(value)


@app.get("/search/email")
def search_email(value: str):
    return PersonService.search_by_email(value)


@app.get("/search/address")
def search_address(value: str):
    return PersonService.search_by_address(value)


@app.get("/record/{record_id}")
def get_record(record_id: str):
    return PersonService.get_record(record_id)


# --------------------------------------
# RUN (Development)
# --------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
