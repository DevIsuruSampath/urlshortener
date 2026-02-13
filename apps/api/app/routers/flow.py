from fastapi import APIRouter

router = APIRouter()

@router.post("/step-complete")
def step_complete():
    return {"ok": True}

@router.get("/go")
def go():
    return {"ok": True}
