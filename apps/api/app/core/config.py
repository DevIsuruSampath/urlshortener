from pydantic import BaseModel
import os

class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "")
    redis_url: str = os.getenv("REDIS_URL", "")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")

settings = Settings()
