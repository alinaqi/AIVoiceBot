from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.services import backendless_service

router = APIRouter()

class BusinessInfo(BaseModel):
    user_id: str
    business_name: str
    business_industry: str
    business_description: str

@router.post("/update")
def update_business_info(info: BusinessInfo):
    try:
        updated_user = backendless_service.update_user_info(info.user_id, info.business_name, info.business_industry, info.business_description)
        return {"status": "success", "user_id": updated_user.objectId}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
