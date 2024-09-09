from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import stripe
import json

stripe.api_key = "STRIPE_API_KEY"

router = APIRouter()

class CreatePaymentRequest(BaseModel):
    amount: int

class CreateCheckoutSessionRequest(BaseModel):
    user_id: str
    amount: int
    area_code: str
    country_code: str
    phone_number: str
    use_cases: dict
    
@router.post("/create-payment-intent")
async def create_payment_intent(request: CreatePaymentRequest):
    try:
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency="usd",
            payment_method_types=["card"],
        )
        return {"clientSecret": intent["client_secret"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@router.post("/create-checkout-session")
async def create_checkout_session(request: CreateCheckoutSessionRequest):
    try:
        print("creating checkout session")
        price_id ="STRIPE_PRICE_ID" # price on live
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            success_url='YOUR_URL/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='YOUR_URL/cancel',
            metadata={
                'user_id': request.user_id,
                'area_code': request.area_code,
                'country_code': request.country_code,
                'phone_number': request.phone_number,
                'use_cases': json.dumps(request.use_cases)  # Ensure use_cases are stringified
            }
        )
        return {"id": session.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 

@router.get("/checkout-session/{session_id}")
async def get_checkout_session(session_id: str):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))