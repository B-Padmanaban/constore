from fastapi import APIRouter
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta

load_dotenv()
router = APIRouter()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/constore"))
db = client["constore"]

@router.get("/sales-summary")
def sales_summary():
    """Return total revenue, orders, and top products."""
    pipeline = [
        { "$match": { "isPaid": True } },
        { "$group": {
            "_id": None,
            "totalRevenue": { "$sum": "$totalPrice" },
            "totalOrders":  { "$sum": 1 },
            "avgOrderValue": { "$avg": "$totalPrice" }
        }}
    ]
    result = list(db.orders.aggregate(pipeline))
    return result[0] if result else {"totalRevenue": 0, "totalOrders": 0, "avgOrderValue": 0}

@router.get("/top-products")
def top_products(limit: int = 5):
    """Return best-selling products by quantity sold."""
    pipeline = [
        { "$unwind": "$orderItems" },
        { "$group": {
            "_id": "$orderItems.product",
            "name": { "$first": "$orderItems.name" },
            "totalQty": { "$sum": "$orderItems.qty" },
            "totalRevenue": { "$sum": { "$multiply": ["$orderItems.price", "$orderItems.qty"] } }
        }},
        { "$sort": { "totalQty": -1 } },
        { "$limit": limit }
    ]
    return list(db.orders.aggregate(pipeline))

@router.get("/revenue-by-day")
def revenue_by_day(days: int = 30):
    """Return daily revenue for the last N days."""
    since = datetime.utcnow() - timedelta(days=days)
    pipeline = [
        { "$match": { "isPaid": True, "paidAt": { "$gte": since } } },
        { "$group": {
            "_id": { "$dateToString": { "format": "%Y-%m-%d", "date": "$paidAt" } },
            "revenue": { "$sum": "$totalPrice" },
            "orders":  { "$sum": 1 }
        }},
        { "$sort": { "_id": 1 } }
    ]
    return list(db.orders.aggregate(pipeline))
