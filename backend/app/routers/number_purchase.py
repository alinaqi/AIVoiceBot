from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
from app.services import redis_service
import openai
import asyncio

router = APIRouter()

openai.api_key = "OPENAPI_API_KEY"


class PurchaseNumberRequest(BaseModel):
    user_id: str
    area_code: str
    prompt: str
    country_code: str
    phone_number: str
    use_cases: dict

class UpdatePurchasedNumberRequest(BaseModel):
    user_id: str
    number: str
    prompt: str
    use_cases: dict

BLAND_AUTHORIZATION = "BLAND_API_KEY"
BLAND_API_URL = "https://api.bland.ai/v1/inbound/purchase"

prompt_template = """ 
Create a voice agent script and guideline based on the following example guideline. 
The business information and use case is given below:

For the script, please always use the agent name as Alex. 

Example guideline: 
Your name is Alex, and you’re a support agent working on behalf of the company described below. The company information and the use case you will be handling is mentioned below.

Always ask user questions based on the use case.
example diaog:
Person: Hello this is Squaw Valley Plumbing Co, my name is Jessica, how can I help you?
You: Hi Jessica, this is Sarah, I’m calling on behalf of a local small business directory. I wanted to create a listing for your company - do you have time to help?
Person: Yeah absolutely. Just to make sure though, you’re making a local directory? What do you need to know?
You: Yes, we collect this information on a semi-annual basis to understand the state and overall health of small businesses in the valley. I just have a list of questions to go through.
Person: Sounds good, go for it.
You: Awesome. First question is: what services do you all provide to the community?
Person: We provide plumbing services. Most of the time it’s folks calling in because they have an issue with their sink or toilet. You know how it is.
You: Right, yeah. Second question is: what are your hours of operations?
Person: Monday through Saturday it’s 9am-7pm. And then Sundays it’s 10am-2pm.
You: Do you observe federal holidays?
Person: Yes of course.
You: Okay, perfect. And at this point, could you give me a sense of how long you’ve been serving our community for?
Person: We opened up shop about ten years ago. Feels like we’ve been in the valley forever.
You: Haha I’m sure. And at this point, how large have you all gotten? Could you give me a sense of how many folks you’re currently employing?
Person: Yeah we’ve gotten pretty big. We have around 10 plumbers on staff, and then a team of support people working around them.
You: Fantastic, that’s great to hear. Last question is: could you share the owner’s contact information with me? We won’t give this info out, but it helps us if we need to follow up and collect more info. 
Person: Eh, I’m not sure if I’m comfortable doing that
You: Yeah no worries, it’s completely up to you. We have a few programs we offer to small businesses in the area, and if you qualify it’s just easier to reach out direct. But again, no worries at all if you don’t feel comfortable sharing.
Person: Oh, that’s fine then. The owner’s name is Michael Shelly and his phone number is 8781086645.
You: Perfect, thanks so much for your help.
Person: Of course! Goodbye.
end of example. 

See below for the business information and use case:

"""
  

# @router.post("/purchase_number")
# async def purchase_number(request: PurchaseNumberRequest):

#     # extract user informaton 
#     user_data = redis_service.get_user_by_id(request.user_id)
#     if not user_data:
#         raise HTTPException(status_code=404, detail="User not found")

#     user_phone = user_data.get("userPhone")
#     user_business_info = eval(user_data.get("userBusinessInfo", "{}"))

#     business_name = user_business_info.get("business_name", "Unknown Business")
#     business_description = user_business_info.get("description", "No description provided")

#     if not user_phone or not user_business_info:
#         raise HTTPException(status_code=400, detail="Incomplete user data")

#     business_information = (f"Business Name: {business_name}\n"
#               f"Business Description: {business_description}\n"
#               f"For the use case: {request.use_cases}")
    
#     # use gpt-4o-mini to create prompt
#     response = openai.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": prompt_template},
#                 {"role": "user", "content": business_information}
#             ]
#         )
    
#     prompt = response.choices[0].message.content

#     headers = {
#         "Authorization": BLAND_AUTHORIZATION,
#         "Content-Type": "application/json"
#     }
#     payload = {
#         "area_code": request.area_code,
#         "prompt": prompt,
#         "country_code": request.country_code,
#         "webhook": "http://localhost:8000/webhook",
#         "phone_number": request.phone_number
#     }

#     print("payload: ", payload)


#     async with httpx.AsyncClient() as client:
#         response = await client.post(BLAND_API_URL, headers=headers, json=payload)
#         if response.status_code == 200:
#             redis_service.save_purchased_number(request.user_id, request.phone_number, prompt, request.use_cases)
#             return response.json()
#         else:
#             print("response: ", response.text)
#             raise HTTPException(status_code=response.status_code, detail=response.text)

BLAND_AUTHORIZATION_WEB = "BLAND_USER_KEY"

@router.post("/purchase_number")
async def purchase_number(request: PurchaseNumberRequest):
    
    user_data = redis_service.get_user_by_id(request.user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_phone = user_data.get("userPhone")
    user_business_info = eval(user_data.get("userBusinessInfo", "{}"))

    business_name = user_business_info.get("business_name", "Unknown Business")
    business_description = user_business_info.get("description", "No description provided")

    if not user_phone or not user_business_info:
        raise HTTPException(status_code=400, detail="Incomplete user data")

    business_information = (f"Business Name: {business_name}\n"
              f"Business Description: {business_description}\n"
              f"For the use case: {request.use_cases}")
    
    # use gpt-4o-mini to create prompt
    response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt_template},
                {"role": "user", "content": business_information}
            ]
        )
    
    prompt = response.choices[0].message.content

    redis_service.save_purchased_number(request.user_id, request.phone_number, prompt, request.use_cases)

    headers = {
        "Authorization": BLAND_AUTHORIZATION_WEB,
        "Content-Type": "application/json"
    }
    payload = {
        "phone_number": request.phone_number,
        "user_id": "YOUR_USER_ID",
        "type": "inbound",
        "preselected": True,
        "area_code": request.area_code,
        "country_code": request.country_code
    }

    # Fire and forget the API call
    async def make_api_call():
        async with httpx.AsyncClient() as client:
            try:
                print("making https://app.bland.ai/api/numbers/purchase call: ", payload)
                await client.post("https://app.bland.ai/api/numbers/purchase", headers=headers, json=payload)
            except httpx.RequestError as exc:
                print(f"An error occurred while requesting {exc.request.url!r}.")

    # Schedule the API call
    asyncio.create_task(make_api_call())


    return {"status": "success", 
            "user_id": request.user_id,
            "prompt": prompt,
            "number": request.phone_number}

@router.put("/update_purchased_number")
async def update_purchased_number(request: UpdatePurchasedNumberRequest):
    updated_numbers = redis_service.update_purchased_number(request.user_id, request.old_number, request.new_number, request.new_prompt, request.new_use_cases)
    if updated_numbers is not None:
        return {"status": "Purchased number updated successfully", "purchased_numbers": updated_numbers}
    else:
        raise HTTPException(status_code=404, detail="User not found")

@router.get("/purchased_numbers/{user_id}")
async def get_purchased_numbers(user_id: str):
    purchased_numbers = redis_service.get_purchased_numbers(user_id)
    if purchased_numbers is not None:
        return {"purchased_numbers": purchased_numbers}
    else:
        raise HTTPException(status_code=404, detail="User not found")