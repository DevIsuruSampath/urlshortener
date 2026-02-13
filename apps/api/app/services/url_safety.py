from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urlparse


def _is_forbidden_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    return (
        ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    )


def validate_public_destination_url(raw_url: str) -> str:
    parsed = urlparse(raw_url)

    if parsed.scheme not in {"http", "https"}:
        raise ValueError("Only http/https destination URLs are allowed")

    if parsed.username or parsed.password:
        raise ValueError("Destination URL must not contain username/password")

    host = (parsed.hostname or "").strip().lower()
    if not host:
        raise ValueError("Destination URL must include a valid host")

    if host == "localhost" or host.endswith(".localhost"):
        raise ValueError("localhost targets are blocked")

    # Literal IP address check
    try:
        ip = ipaddress.ip_address(host)
        if _is_forbidden_ip(ip):
            raise ValueError("Private/internal destination IPs are blocked")
        return raw_url
    except ValueError:
        # Not an IP literal; continue with DNS resolution checks.
        pass

    # Hostname DNS resolution check
    try:
        infos = socket.getaddrinfo(host, None, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise ValueError("Destination host cannot be resolved") from exc

    resolved_ips: set[str] = set()
    for info in infos:
        addr = info[4][0]
        resolved_ips.add(addr)

    if not resolved_ips:
        raise ValueError("Destination host resolution failed")

    for addr in resolved_ips:
        ip = ipaddress.ip_address(addr)
        if _is_forbidden_ip(ip):
            raise ValueError("Destination host resolves to private/internal IP")

    return raw_url
