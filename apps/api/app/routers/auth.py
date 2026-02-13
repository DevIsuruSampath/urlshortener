from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
def login():
    return {"token": "todo"}

@router.post("/register")
def register():
    return {"ok": True}
