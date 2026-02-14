from pydantic import BaseModel, EmailStr


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str


class AdminSetupIn(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str


class AdminLoginOut(BaseModel):
    ok: bool = True


class AdminMeOut(BaseModel):
    username: str
    user_id: str


class DeveloperTokenOut(BaseModel):
    masked_token: str


class AdminBootstrapStatusOut(BaseModel):
    initialized: bool
