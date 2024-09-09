from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
import httpx
import openai
from app.services import redis_service

router = APIRouter()

openai.api_key = "OPENAPI_API_KEY"

BLAND_AUTHORIZATION = "BLAND_API_KEY"
BLAND_API_URL = "https://api.bland.ai/v1/calls"

class MakeExampleCallRequest(BaseModel):
    user_id: str
    business_name: str
    business_description: str
    industry: str
    use_cases: dict

async def make_bland_call(payload: dict):
    headers = {
        "Authorization": BLAND_AUTHORIZATION,
        "Content-Type": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(BLAND_API_URL, headers=headers, json=payload)
        if response.status_code != 200:
            print(f"Failed to make call: {response.status_code}, {response.text}")



prompt_inbound = """ 
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
    
@router.post("/make_example_call")
async def make_example_call(request: MakeExampleCallRequest, background_tasks: BackgroundTasks):
    user_data = redis_service.get_user_by_id(request.user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_phone = user_data.get("userPhone")

    if not user_phone:
        raise HTTPException(status_code=400, detail="Incomplete user data")

    # Store business information and use cases in Redis
    user_data["userBusinessInfo"] = str({
        "business_name": request.business_name,
        "description": request.business_description,
        "industry": request.industry
    })
    user_data["useCases"] = str(request.use_cases)
    redis_service.update_user_info_detailed(user_data["userId"], request.business_name, request.business_description, request.industry, request.use_cases)

    # Generate prompt using OpenAI GPT-4o-mini
    business_information = (f"Business Name: {request.business_name}\n"
                            f"Business Description: {request.business_description}\n"
                            f"Industry: {request.industry}\n"
                            f"For the use case: {list(request.use_cases.keys())}")

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_inbound},
            {"role": "user", "content": business_information}
        ]
    )

    print("Response: ", response.choices[0].message.content)

    task = response.choices[0].message.content

    headers = {
        "Authorization": BLAND_AUTHORIZATION,
        "Content-Type": "application/json"
    }
    payload = {
        "phone_number": user_phone,
        "task": task,
        "model": "enhanced",
        "voice": "Florian",
        "record": True,
        "interruption_threshold": 100,
    }

    background_tasks.add_task(make_bland_call, payload)   

    return {"status": "Call initiated successfully"}


prompt_outbound = """ 
Create an outbound sales agent script and guideline based on the following example guideline. The goal and business information is specified below:


For the script, please always use the agent name as Alex. 

Example guideline: 
Your name is Alex, and you’re a sales agent working on behalf of the company described below. You are making an outbound call to a prospect. 
Always start with: 'Hello this Alex, I am callng on behalf of <company name>. Do you have a bit of time?'
The company information and the use case you will be handling is mentioned below.

Always ask user questions based on the use case.

Example diaog:
Alex: Hello this Alex, I am callng on behalf of Marketing Solutions Inc. Do you have a bit of time? 
Prospect: Hi Alex, sure. What can I help you with?
Alex: I wanted to share some information about our services. We provide marketing solutions to small businesses in the area.
Prospect: Oh, that’s interesting. What kind of services do you offer?
Alex: We offer a range of services including social media marketing, SEO, and email marketing. We help businesses grow their online presence.
Prospect: That sounds great. Do you provide SEO services as well?
Alex: Yes, we do. We have a team of experts who can help optimize your website and improve your search engine rankings.
Prospect: That’s exactly what I need. How long have you been in business?
Alex: We’ve been in business for over 10 years. We have a proven track record of helping businesses succeed online.
Prospect: That’s impressive. How large is your team?
Alex: We have a team of 20 marketing professionals who are dedicated to helping our clients achieve their goals.
Prospect: That’s great to hear. Can you share some client testimonials with me?
Alex: Absolutely. I can send you some testimonials and case studies that showcase our work.
Prospect: That would be great. What’s the next step?
Alex: The next step would be to schedule a consultation with one of our marketing experts. They can assess your needs and recommend a customized marketing strategy for your business.
Prospect: Sounds good. How do I get in touch with you?
Alex: You can reach me at 555-123-4567 or email me at

See below for the business information and use case:

"""
    
@router.post("/make_example_sales_call")
async def make_example_sales_call(request: MakeExampleCallRequest, background_tasks: BackgroundTasks):
    user_data = redis_service.get_user_by_id(request.user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_phone = user_data.get("userPhone")

    if not user_phone:
        raise HTTPException(status_code=400, detail="Incomplete user data")

    # Store business information and use cases in Redis
    user_data["userBusinessInfo"] = str({
        "business_name": request.business_name,
        "description": request.business_description,
        "industry": request.industry
    })
    user_data["useCases"] = str(request.use_cases)
    redis_service.update_user_info_detailed(user_data["userId"], request.business_name, request.business_description, request.industry, request.use_cases)

    # Generate prompt using OpenAI GPT-4o-mini
    business_information = (f"Business Name: {request.business_name}\n"
                            f"Business Description: {request.business_description}\n"
                            f"Industry: {request.industry}\n"
                            f"For the use case: {list(request.use_cases.keys())}")

    response = openai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": prompt_inbound},
            {"role": "user", "content": business_information}
        ]
    )

    print("Response: ", response.choices[0].message.content)

    task = response.choices[0].message.content

    headers = {
        "Authorization": BLAND_AUTHORIZATION,
        "Content-Type": "application/json"
    }
    payload = {
        "phone_number": user_phone,
        "task": task,
        "model": "enhanced",
        "voice": "Florian",
        "record": True,
        "interruption_threshold": 100,
    }

    background_tasks.add_task(make_bland_call, payload)

    return {"status": "Call initiated successfully"}       


class MakeTestCallWithPromptRequest(BaseModel):
    user_id: str
    number: str
    prompt: str

@router.post("/make_test_call_with_prompt")
async def make_test_call_with_prompt(request: MakeTestCallWithPromptRequest, background_tasks: BackgroundTasks):


    user_data = redis_service.get_user_by_id(request.user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")

    user_phone = user_data.get("userPhone")
    if not user_phone:
        raise HTTPException(status_code=400, detail="User phone number not found")

    headers = {
        "Authorization": BLAND_AUTHORIZATION,
        "Content-Type": "application/json"
    }
    payload = {
        "phone_number": user_phone,
        "task": request.prompt,
        "model": "enhanced",
        "voice": "Florian",
        "record": True,
        "interruption_threshold": 100,
    }

    print("payload: ", payload)

    background_tasks.add_task(make_bland_call, payload)

    return {"status": "Call initiated successfully"}
        

