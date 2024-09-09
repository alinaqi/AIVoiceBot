from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import openai

router = APIRouter()

openai.api_key = "OPEN_API_KEY"

class VoiceAgentPromptRequest(BaseModel):
    business_name: str
    business_description: str
    use_case: str

prompt_template = """ 
Create a voice agent script and guideline based on the following example guideline. 
Only return the script as per the guidelines and no additional information. The format of script should be:

1. Introduction: Overview of name and business as well as business description. 
2. Overview of use case and guidelines for the usecase
3. Example script

For the script, please always use the agent name as Alex. 


Example script: 

Your name is Alex, and you’re a support agent working on behalf of the company described below. The company information and the use case you will be handling is mentioned below.

Always ask user questions based on the use case.

example dialogue:
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

@router.post("/generate_prompt")
async def generate_prompt(request: VoiceAgentPromptRequest):
    business_information = (f"Business Name: {request.business_name}\n"
                            f"Business Description: {request.business_description}\n"
                            f"For the use case: {request.use_case}")

    response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt_template},
                {"role": "user", "content": business_information}
            ]
        )

    prompt = response.choices[0].message.content
    return {"prompt": prompt}
