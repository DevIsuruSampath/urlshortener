from app.core.redis_client import redis_client


def allow_ip_action(ip: str, action: str, limit: int, window_seconds: int = 60) -> bool:
    key = f"ratelimit:{action}:{ip}"
    current = redis_client.incr(key)
    if current == 1:
        redis_client.expire(key, window_seconds)
    return current <= limit
