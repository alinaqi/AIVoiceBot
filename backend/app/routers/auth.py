from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, List
from app.services import twilio_service, redis_service
import uuid

router = APIRouter()

class UserRegistration(BaseModel):
    phone_number: str

class CompleteRegistration(BaseModel):
    phone_number: str
    code: str

class UpdateUserInfo(BaseModel):
    user_id: str
    user_business_info: Dict = Field(default_factory=dict)
    use_cases: Dict = Field(default_factory=dict)

class VoiceAgent(BaseModel):
    number: str
    prompt: str

class UpdateVoiceAgentRequest(BaseModel):
    voice_agent_id: str
    number: str
    prompt: str
    use_cases: dict

class CompleteRegistrationRequest(BaseModel):
    phone_number: str
    code: str

class TokenValidationRequest(BaseModel):
    token: str


@router.post("/register")
def register_user(user: UserRegistration):
    try:
        verification_sid = twilio_service.send_custom_verification_code(user.phone_number)
        key, user_data = redis_service.store_user(user.phone_number, verification_sid)
        return {"verification_sid": verification_sid}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/complete_registration")
async def complete_registration(request: CompleteRegistrationRequest):
    try:
        print("phone number: ", request.phone_number)
        print("code: ", request.code)
        if twilio_service.verify_code(request.phone_number, request.code):
            user_data = redis_service.get_user_id_by_phone(request.phone_number)
            print("user: " , user_data)
            token = create_token(user_data["userId"])  # Function to create a user session token
            return {"token": token, "user_id": user_data["userId"]}
        else:
            raise HTTPException(status_code=400, detail="Invalid code")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}")
def get_user(user_id: str):
    try:
        user_data = redis_service.get_user_by_id(user_id)
        if user_data:
            return user_data
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/user/update")
def update_user_info(user_info: UpdateUserInfo):
    try:
        updated_user_data = redis_service.update_user_info(user_info.user_id, user_info.user_business_info, user_info.use_cases)
        if updated_user_data:
            return {"status": "User information updated successfully", "user_data": updated_user_data}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/user/{user_id}/voice_agent")
def create_voice_agent(user_id: str, voice_agent: VoiceAgent):
    try:
        new_voice_agent = redis_service.create_voice_agent(user_id, voice_agent.number, voice_agent.prompt)
        if new_voice_agent:
            return {"status": "Voice agent created successfully", "voice_agent": new_voice_agent}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/user/{user_id}/voice_agent")
def update_voice_agent(user_id: str, request: UpdateVoiceAgentRequest):
    try:
        print("request: ", request)

        updated_agents = redis_service.update_purchased_number(user_id, request.number, request.prompt, request.use_cases)
        if updated_agents is not None:
            return {"status": "Voice agent updated successfully", "voice_agents": updated_agents}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        print("error: ", e)
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/user/{user_id}/voice_agent/{voice_agent_id}")
def delete_voice_agent(user_id: str, voice_agent_id: str):
    try:
        remaining_voice_agents = redis_service.delete_voice_agent(user_id, voice_agent_id)
        if remaining_voice_agents is not None:
            return {"status": "Voice agent deleted successfully", "voice_agents": remaining_voice_agents}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}/voice_agents")
def get_all_voice_agents(user_id: str):
    try:
        voice_agents = redis_service.get_all_voice_agents(user_id)
        if voice_agents is not None:
            return {"voice_agents": voice_agents}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/validate_token")
async def validate_token(request: TokenValidationRequest):
    if redis_service.is_token_valid(request.token):
        return {"valid": True}
    else:
        return {"valid": False}

@router.post("/logout")
async def logout(request: TokenValidationRequest):
    try:
        redis_service.delete_token(request.token)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
def create_token(user_id: str):
    # This function should create a session token and store it in Redis with an expiration time
    token = str(uuid.uuid4())
    redis_service.store_token(token, user_id)
    return token

