from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analytics, image_processor

app = FastAPI(title="Constore Python Services", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
app.include_router(image_processor.router, prefix="/images", tags=["Image Processing"])

@app.get("/health")
def health():
    return {"status": "ok", "service": "constore-python"}
