from fastapi import APIRouter

router = APIRouter()

@router.get("/{code}")
def redirect_by_code(code: str):
    return {"code": code}
