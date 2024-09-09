from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import redis_service

router = APIRouter()

class UseCaseRequest(BaseModel):
    user_id: str
    use_case_key: str
    use_case_value: str

class DeleteUseCaseRequest(BaseModel):
    user_id: str
    use_case_key: str

@router.get("/use_cases/{user_id}")
def get_all_use_cases(user_id: str):
    try:
        use_cases = redis_service.get_all_use_cases(user_id)
        if use_cases is not None:
            return {"use_cases": use_cases}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/use_cases")
def add_use_case(request: UseCaseRequest):
    try:
        use_cases = redis_service.add_use_case(request.user_id, request.use_case_key, request.use_case_value)
        if use_cases is not None:
            return {"status": "Use case added successfully", "use_cases": use_cases}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/use_cases")
def update_use_case(request: UseCaseRequest):
    try:
        use_cases = redis_service.update_use_case(request.user_id, request.use_case_key, request.use_case_value)
        if use_cases is not None:
            return {"status": "Use case updated successfully", "use_cases": use_cases}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/use_cases")
def delete_use_case(request: DeleteUseCaseRequest):
    try:
        use_cases = redis_service.delete_use_case(request.user_id, request.use_case_key)
        if use_cases is not None:
            return {"status": "Use case deleted successfully", "use_cases": use_cases}
        else:
            raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
