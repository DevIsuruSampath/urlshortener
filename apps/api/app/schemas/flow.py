from pydantic import BaseModel


class StepCompleteIn(BaseModel):
    session_id: str
    step: int
    token: str
    captcha_token: str | None = None


class StepCompleteOut(BaseModel):
    done: bool
    next_step: int | None = None
    next_step_url: str | None = None
    redirect_url: str | None = None
    requires_captcha: bool = False
    message: str | None = None
