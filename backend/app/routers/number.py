from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter()

class AvailableNumbersRequest(BaseModel):
    area_code: str
    country_code: str

BLAND_AUTHORIZATION_WEB = "BLAND_USER_KEY"
BLAND_API_URL = "https://app.bland.ai/api/numbers/get_available_numbers"
FIXED_USER_ID = "YOUR_USER_ID"

@router.post("/get_available_numbers")
async def get_available_numbers(request: AvailableNumbersRequest):
    headers = {
        "Authorization": BLAND_AUTHORIZATION_WEB,
        "Content-Type": "application/json"
    }
    payload = {
        "user_id": FIXED_USER_ID,
        "area_code": request.area_code,
        "country_code": request.country_code
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(BLAND_API_URL, headers=headers, json=payload)
        if response.status_code == 200:
            return response.json()
        else:
            print("response: ", response.text)
            raise HTTPException(status_code=response.status_code, detail=response.text)
