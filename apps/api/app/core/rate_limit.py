from redis.exceptions import RedisError

from app.core.redis_client import redis_client


def allow_ip_action(ip: str, action: str, limit: int, window_seconds: int = 60) -> bool:
    # non-positive values disable the limiter for that action
    if limit <= 0:
        return True

    key = f"ratelimit:{action}:{ip}"
    try:
        current = redis_client.incr(key)
        if current == 1:
            redis_client.expire(key, window_seconds)
        return current <= limit
    except RedisError:
        # fail open when Redis is unavailable to avoid taking down core flows
        return True
