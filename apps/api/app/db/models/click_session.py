from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base

class ClickSession(Base):
    __tablename__ = "click_sessions"
    id: Mapped[int] = mapped_column(primary_key=True)
