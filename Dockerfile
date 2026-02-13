FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    nginx \
    supervisor \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python virtualenv (avoids Debian PEP 668 "externally-managed-environment" error)
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:${PATH}"

# API dependencies
COPY apps/api/requirements.txt /app/apps/api/requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
  && pip install --no-cache-dir -r /app/apps/api/requirements.txt

# Web dependencies
COPY apps/web/package*.json /app/apps/web/
RUN cd /app/apps/web && npm install

# App source
COPY . /app

# Build Next.js app for production runtime
RUN cd /app/apps/web && npm run build

# Single-container reverse proxy config + process manager
COPY docker/nginx.single.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

ENV PYTHONPATH=/app/apps/api \
    NEXT_PUBLIC_API_BASE=/api \
    PORT=80

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]
