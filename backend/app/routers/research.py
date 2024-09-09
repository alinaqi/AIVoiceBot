from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import openai
from app.services import redis_service

router = APIRouter()

openai.api_key = "OPEN_API_KEY"

class ResearchRequest(BaseModel):
    url: str

prompt_research = """
Find out information from the following url, in json format. Do not make up any information. Only provide information that is available on the website. If the information is not available, leave the field empty.
{
    "BusinessName": <business name>,
    "BusinessDescription": <evaluate the correct detailed description from the urk>,
    "KeyProducts": <get key products from the url>,
    "KeyServices": <get key services from the url>, 
    'Contact": <get contact information from the url. Only if available. Do not make up any information>,
    "Locations": <get locations from the url if available.>,
    "Industry": <evaluate the correct industry>,

The url is given below:
}
"""

@router.post("/research")
async def research(request: ResearchRequest):
    try:
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            response_format={ "type": "json_object"},
            messages=[
                {"role": "system", "content": prompt_research},
                {"role": "user", "content": request.url}
            ]
        )

        print(response.choices[0].message.content)
        return response.choices[0].message.content

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Internal server error")
