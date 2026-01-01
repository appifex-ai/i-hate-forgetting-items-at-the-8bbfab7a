"""
Main FastAPI application for Vercel deployment
Entry point: /api/*
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import stores, items

app = FastAPI(title="Shopping List API")

# CORS - allow all origins for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(stores.router, prefix="/api")
app.include_router(items.router, prefix="/api")


@app.get("/api")
def root():
    return {"message": "Shopping List API"}


@app.get("/health")
def health_root():
    """Root-level health check for deployment verification"""
    return {"status": "healthy"}


@app.get("/api/health")
def health():
    return {"status": "healthy"}
