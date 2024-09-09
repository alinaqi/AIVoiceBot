import requests

API_KEY = 'BLAND_API_KEY'

def purchase_number(area_code: str, prompt: str, country_code: str, webhook: str, phone_number: str):
    url = "https://api.bland.ai/v1/inbound/purchase"
    payload = {
        "area_code": area_code,
        "prompt": prompt,
        "country_code": country_code,
        "webhook": webhook,
        "phone_number": phone_number
    }
    headers = {
        "authorization": API_KEY,
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

def set_prompt_settings(phone_number: str, settings: dict):
    url = f"https://api.bland.ai/v1/inbound/{phone_number}"
    headers = {
        "authorization": API_KEY,
        "Content-Type": "application/json"
    }
    response = requests.post(url, json=settings, headers=headers)
    return response.json()
