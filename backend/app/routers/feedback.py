from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
from app.services import redis_service

router = APIRouter()

class FeedbackRequest(BaseModel):
    user_id: str
    rating: int
    feedback: str

@router.post("/feedback/submit")
async def submit_feedback(request: FeedbackRequest):
    user_data = redis_service.get_user_by_id(request.user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    ratings = eval(user_data.get("ratings", "[]"))
    ratings.append({"rating": request.rating, "feedback": request.feedback})
    user_data["ratings"] = str(ratings)
    redis_service.update_user_data(request.user_id, user_data)

    return {"status": "Feedback submitted successfully"}

@router.get("/feedback/all")
async def get_all_feedback():
    all_user_ids = redis_service.get_all_user_ids()  # Get all user IDs
    all_feedback = []

    for user_id in all_user_ids:
        user_data = redis_service.get_user_by_id(user_id)
        if user_data:
            ratings = eval(user_data.get("ratings", "[]"))
            feedback_entry = {
                "user_id": user_id,
                "user_phone": user_data.get("userPhone", "N/A"),
                "ratings": ratings
            }
            all_feedback.append(feedback_entry)

    return {"feedback": all_feedback}
    