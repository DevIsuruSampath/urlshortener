from pydantic import BaseModel

class StepCompleteIn(BaseModel):
    session_id: str
    step: int
