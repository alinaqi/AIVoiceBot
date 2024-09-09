from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.routers import auth, number, call, use_case, number_purchase, voice_agent, dashboard
from app.routers.payment_router import router as payment_router
from app.routers import feedback
from app.routers import inbound
from app.routers import research

app = FastAPI()

#Set up CORS
origins = [
    "*" # Allow whatever origins.. i restrict it always
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RestrictMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")

        # Debug statements
        print(f"Origin: {origin}")
        print(f"Referer: {referer}")

        if origin not in origins and (referer is None or not any(referer.startswith(o) for o in origins)):
            print(f"Blocking request from origin: {origin}, referer: {referer}")
            return JSONResponse(content={"detail": "Forbidden"}, status_code=403)

        response = await call_next(request)
        return response

app.add_middleware(RestrictMiddleware)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(number.router, prefix="/number", tags=["number"])
app.include_router(call.router, prefix="/call", tags=["call"])
app.include_router(use_case.router, prefix="/use_case", tags=["use_case"])
app.include_router(dashboard.router, prefix="", tags=["dashboard"])
app.include_router(number_purchase.router, prefix="/number_purchase", tags=["number_purchase"])
app.include_router(voice_agent.router, prefix="/voice_agent", tags=["voice_agent"])
app.include_router(payment_router, prefix="/payment", tags=["payment"])
app.include_router(feedback.router, prefix="", tags=["feedback"])
app.include_router(inbound.router, prefix="/inbound", tags=["inbound"])
app.include_router(research.router, prefix="", tags=["research"])

@app.get("/")
def read_root():
    return {"message": "Welcome to VoiceAgents API"}
