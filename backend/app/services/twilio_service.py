import logging
from twilio.rest import Client

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Twilio credentials
ACCOUNT_SID = 'TWILIO_ACCOUNT_SID'
AUTH_TOKEN = 'TWILIO_AUTH_TOKEN'
VERIFY_SERVICE_SID = 'TWILIO_VERIFY_SERVICE_SID'

client = Client(ACCOUNT_SID, AUTH_TOKEN)

def send_custom_verification_code(phone_number: str):
    try:
        verification = client.verify.services(VERIFY_SERVICE_SID).verifications.create(to=phone_number, channel='sms')
        logging.debug(f"Sent verification code: {verification.status}")
        return verification.sid
    except Exception as e:
        logging.error(f"Error sending verification code: {e}")
        raise

def verify_code(phone_number: str, code: str):
    try:
        verification_check = client.verify.services(VERIFY_SERVICE_SID).verification_checks.create(to=phone_number, code=code)
        logging.debug(f"Verification check status: {verification_check.status}")
        return verification_check.status == "approved"
    except Exception as e:
        logging.error(f"Error verifying code: {e}")
        raise