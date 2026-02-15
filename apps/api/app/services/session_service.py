from urllib.parse import urlencode

from app.core.config import settings
from app.services.link_service import b64u_encode


def build_interstitial_url(code: str, publisher_id: str, session_id: str, total_steps: int, st: str, step: int = 1) -> str:
    # Use dedicated interstitial domain if available, else fallback to public web base
    domain = settings.interstitial_domain or settings.public_web_base_url.rstrip('/').replace("https://", "").replace("http://", "")
    
    # Ensure protocol (default to https unless local)
    if "localhost" in domain:
        base = f"http://{domain}"
    else:
        base = f"https://{domain}"

    query = urlencode(
        {
            "lid": b64u_encode(code),
            "pid": publisher_id,
            "vid": session_id,
            "pages": b64u_encode(str(total_steps)),
            "step": step,
            "st": st,
        }
    )
    return f"{base}/l?{query}"
