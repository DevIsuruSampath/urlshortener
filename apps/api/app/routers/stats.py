from fastapi import APIRouter

router = APIRouter()

@router.get("")
def stats():
    return {"clicks": 0, "earnings": 0}
