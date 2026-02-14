from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.models.click_session import ClickSession
from app.db.models.link import Link
from app.db.models.user import User
from app.db.session import get_db

router = APIRouter()


@router.get("")
def basic_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    total_links = db.execute(select(func.count()).select_from(Link).where(Link.user_id == user.id)).scalar_one()

    total_sessions = db.execute(
        select(func.count())
        .select_from(ClickSession)
        .where(ClickSession.publisher_id == user.id)
    ).scalar_one()

    completed = db.execute(
        select(func.count())
        .select_from(ClickSession)
        .where(ClickSession.publisher_id == user.id)
        .where(ClickSession.status == "completed")
    ).scalar_one()

    payable = db.execute(
        select(func.count())
        .select_from(ClickSession)
        .where(ClickSession.publisher_id == user.id)
        .where(ClickSession.status == "completed")
        .where(ClickSession.payable.is_(True))
    ).scalar_one()

    return {
        "total_links": total_links,
        "total_click_sessions": total_sessions,
        "completed_sessions": completed,
        "payable_sessions": payable,
    }
