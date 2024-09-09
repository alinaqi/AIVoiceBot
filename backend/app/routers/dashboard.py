from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
import httpx
from typing import List
from app.services import redis_service
from datetime import datetime, timedelta

router = APIRouter()

BLAND_AUTHORIZATION = "BLAND_API_KEY"

class CallSummary(BaseModel):
    id: str
    date: str
    from_number: str
    summary: str
    recording_url: str

async def fetch_calls_for_number(client, number, start_date=None):
    headers = {
        "Authorization": BLAND_AUTHORIZATION
    }
    params = {"to_number": number}
    if start_date:
        params["start_date"] = start_date
    response = await client.get("https://api.bland.ai/v1/calls", headers=headers, params=params)
    calls_data = response.json()
    return calls_data.get("calls", [])

@router.get("/dashboard/{user_id}")
async def get_dashboard_data(user_id: str, filter: str = Query("1day")):
    headers = {
        "Authorization": BLAND_AUTHORIZATION
    }

    # Fetch all registered numbers for the user
    user_phone_numbers = redis_service.get_user_phone_numbers(user_id)
    if not user_phone_numbers:
        raise HTTPException(status_code=404, detail="No registered phone numbers found for user")

    call_summaries = []

    async with httpx.AsyncClient() as client:
        for number in user_phone_numbers:
            start_date = None
            if filter == "1day":
                start_date = (datetime.utcnow() - timedelta(days=1)).strftime('%Y-%m-%d')
            calls = await fetch_calls_for_number(client, number, start_date)
            for call in calls:
                call_id = call.get("call_id")
                call_details_response = await client.get(f"https://api.bland.ai/v1/calls/{call_id}", headers=headers)
                call_details = call_details_response.json()
                call_summaries.append(call_details)

    return {"calls": call_summaries}
