from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import health, auth, users, roles, plans, dashboard

app = FastAPI(title="NEXORA Governance Service")

origins = [
    "https://compras-gov-ai-nexora.vercel.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(roles.router, prefix="/api/v1/roles", tags=["roles"])
app.include_router(plans.router, prefix="/api/v1/plans", tags=["plans"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
