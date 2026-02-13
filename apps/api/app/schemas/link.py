from pydantic import BaseModel, HttpUrl


class LinkCreateIn(BaseModel):
    destination_url: HttpUrl
    tier: str = "standard"


class LinkOut(BaseModel):
    id: str
    code: str
    destination_url: str
    tier: str
    web_steps: int


class LinkStatsOut(BaseModel):
    total_links: int
    total_click_sessions: int
    completed_sessions: int
    payable_sessions: int
