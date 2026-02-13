from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, flow, links, redirect, stats

app = FastAPI(title="PaidLink API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True}


app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(links.router, prefix="/api/links", tags=["links"])
app.include_router(stats.router, prefix="/api/stats", tags=["stats"])
app.include_router(flow.router, prefix="/api/flow", tags=["flow"])
app.include_router(redirect.router, tags=["redirect"])
