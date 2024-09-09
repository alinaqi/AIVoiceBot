import stripe

stripe.api_key = "STRIPE_API_KEY"

def create_payment_intent(amount, currency="usd"):
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method_types=["card"],
        )
        return intent
    except Exception as e:
        return str(e)
