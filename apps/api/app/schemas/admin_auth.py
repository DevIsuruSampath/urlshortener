from pydantic import BaseModel, EmailStr


class AdminLoginIn(BaseModel):
    email: EmailStr
    password: str | None = None
    recovery_code: str | None = None


class AdminSetupIn(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str


class AdminLoginOut(BaseModel):
    ok: bool = True


class AdminSetupOut(BaseModel):
    initialized: bool
    recovery_codes: list[str] = []


class AdminMeOut(BaseModel):
    username: str
    user_id: str


class DeveloperTokenOut(BaseModel):
    masked_token: str


class AdminBootstrapStatusOut(BaseModel):
    initialized: bool
