from fastapi import FastAPI
from app.api.v1.api import api_router


app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "DataHub Service is running"}


app.include_router(api_router, prefix="/api/v1")
