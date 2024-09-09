from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import bland_api

router = APIRouter()

class PurchaseNumber(BaseModel):
    area_code: str
    prompt: str
    country_code: str
    webhook: str
    phone_number: str

class PromptSettings(BaseModel):
    phone_number: str
    settings: dict

@router.post("/purchase")
def purchase_number(data: PurchaseNumber):
    try:
        response = bland_api.purchase_number(data.area_code, data.prompt, data.country_code, data.webhook, data.phone_number)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/set_prompt")
def set_prompt(data: PromptSettings):
    try:
        response = bland_api.set_prompt_settings(data.phone_number, data.settings)
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
