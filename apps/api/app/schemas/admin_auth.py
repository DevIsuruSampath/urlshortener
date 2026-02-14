from pydantic import BaseModel


class AdminLoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AdminMeOut(BaseModel):
    username: str
    user_id: str


class DeveloperTokenOut(BaseModel):
    masked_token: str
