import redis
import uuid
from app.config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
import json
from typing import List, Dict, Any

redis_client = redis.StrictRedis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password=REDIS_PASSWORD,
    decode_responses=True
)

def generate_user_id():
    return str(uuid.uuid4())

def generate_voice_agent_id():
    return str(uuid.uuid4())

def store_user(phone_number: str, verification_sid: str):
    keys = redis_client.keys("VoiceAgentsUsers:*")
    for key in keys:
        user_data = redis_client.hgetall(key)
        if user_data.get("userPhone") == phone_number:
            # Update the verification SID for the existing user
            user_data["verification_sid"] = verification_sid
            redis_client.hmset(key, user_data)
            return key, user_data

    # Create a new user
    user_id = generate_user_id()
    user_data = {
        "userId": user_id,
        "userPhone": phone_number,
        "userBusinessInfo": "{}",
        "useCases": "{}",
        "voiceAgents": "[]",
        "verification_sid": verification_sid,
        "verified": "False"
    }
    redis_client.hmset(f"VoiceAgentsUsers:{user_id}", user_data)
    return f"VoiceAgentsUsers:{user_id}", user_data

def update_user_data(user_id: str, user_data: Dict[str, Any]):
    key = f"VoiceAgentsUsers:{user_id}"
    redis_client.hmset(key, user_data)

def get_user(phone_number: str):
    keys = redis_client.keys("VoiceAgentsUsers:*")
    for key in keys:
        user_data = redis_client.hgetall(key)
        if user_data.get("userPhone") == phone_number:
            return user_data
    return None

def complete_user_registration(phone_number: str):
    keys = redis_client.keys("VoiceAgentsUsers:*")
    for key in keys:
        user_data = redis_client.hgetall(key)
        if user_data.get("userPhone") == phone_number:
            user_data["verified"] = "True"
            redis_client.hmset(key, user_data)
            return user_data
    return None

def get_user_by_id(user_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    return user_data if user_data else None

def update_user_info(user_id: str, user_business_info: dict, use_cases: dict):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    user_data["userBusinessInfo"] = str(user_business_info)
    user_data["useCases"] = str(use_cases)
    redis_client.hmset(key, user_data)
    return user_data

def update_user_info_detailed(user_id: str, business_name: str, business_description: str, industry: str, use_cases: dict):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    user_business_info = {
        "business_name": business_name,
        "description": business_description,
        "industry": industry
    }

    user_data["userBusinessInfo"] = json.dumps(user_business_info)
    user_data["useCases"] = json.dumps(use_cases)
    redis_client.hmset(key, user_data)
    return user_data
def create_voice_agent(user_id: str, number: str, prompt: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    voice_agent_id = generate_voice_agent_id()
    voice_agent = {
        "voice_agent_id": voice_agent_id,
        "number": number,
        "prompt": prompt
    }
    voice_agents = eval(user_data.get("voiceAgents", "[]"))
    voice_agents.append(voice_agent)
    user_data["voiceAgents"] = str(voice_agents)
    redis_client.hmset(key, user_data)
    return voice_agent

def update_voice_agent(user_id: str, voice_agent_id: str, number: str, prompt: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    voice_agents = eval(user_data.get("voiceAgents", "[]"))
    for agent in voice_agents:
        if agent["voice_agent_id"] == voice_agent_id:
            agent["number"] = number
            agent["prompt"] = prompt
            break
    user_data["voiceAgents"] = str(voice_agents)
    redis_client.hmset(key, user_data)
    return voice_agents

def delete_voice_agent(user_id: str, voice_agent_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    voice_agents = eval(user_data.get("voiceAgents", "[]"))
    voice_agents = [agent for agent in voice_agents if agent["voice_agent_id"] != voice_agent_id]
    user_data["voiceAgents"] = str(voice_agents)
    redis_client.hmset(key, user_data)
    return voice_agents

def get_all_voice_agents(user_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None

    return eval(user_data.get("voiceAgents", "[]"))

def get_all_use_cases(user_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None
    return eval(user_data.get("useCases", "{}"))

def add_use_case(user_id: str, use_case_key: str, use_case_value: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None
    use_cases = eval(user_data.get("useCases", "{}"))
    use_cases[use_case_key] = use_case_value
    user_data["useCases"] = str(use_cases)
    redis_client.hmset(key, user_data)
    return use_cases

def update_use_case(user_id: str, use_case_key: str, use_case_value: str):
    return add_use_case(user_id, use_case_key, use_case_value)

def delete_use_case(user_id: str, use_case_key: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return None
    use_cases = eval(user_data.get("useCases", "{}"))
    if use_case_key in use_cases:
        del use_cases[use_case_key]
    user_data["useCases"] = str(use_cases)
    redis_client.hmset(key, user_data)
    return use_cases

def save_purchased_number(user_id: str, phone_number: str, prompt: str, use_cases: dict):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    
    if user_data:
        voice_agents = json.loads(user_data.get("voiceAgents", "[]"))
        voice_agents.append({
            "number": phone_number,
            "prompt": prompt,
            "use_cases": use_cases
        })
        user_data["voiceAgents"] = json.dumps(voice_agents)
        redis_client.hmset(key, user_data)

def update_purchased_number(user_id: str, number: str, prompt: str, use_cases: dict):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    print("user_data: ", user_data)
    
    if user_data:
        voice_agents = json.loads(user_data.get("voiceAgents", "[]").replace("'", "\""))
        print("voice_agents: ", voice_agents)


        for agent in voice_agents:
            print("agent: ", agent)
            if agent["number"] == number:
                agent["prompt"] = prompt
                agent["use_cases"] = use_cases
                break
        user_data["voiceAgents"] = json.dumps(voice_agents)
        redis_client.hmset(key, user_data)
        return voice_agents
    return None

def get_purchased_numbers(user_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    
    if user_data:
        return json.loads(user_data.get("voiceAgents", "[]"))
    return None

def store_token(token: str, user_id: str):
    redis_client.setex(token, 7200, user_id)  # Set token with an expiration time of 2 hours (7200 seconds)

def is_token_valid(token: str):
    return redis_client.exists(token) == 1

def get_user_id_by_phone(phone_number: str):
    keys = redis_client.keys("VoiceAgentsUsers:*")
    for key in keys:
        user_data = redis_client.hgetall(key)
        if user_data.get("userPhone") == phone_number:
            user_data["verified"] = "True"
            redis_client.hmset(key, user_data)
            return user_data

def delete_token(token: str):
    redis_client.delete(token)

def get_user_phone_numbers(user_id: str):
    key = f"VoiceAgentsUsers:{user_id}"
    user_data = redis_client.hgetall(key)
    if not user_data:
        return []

    voice_agents = eval(user_data.get("voiceAgents", "[]"))
    return [agent["number"] for agent in voice_agents]


def get_all_user_ids():
    return [key.split(":")[1] for key in redis_client.keys("VoiceAgentsUsers:*")]
