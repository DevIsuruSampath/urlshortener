FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    python3 \
    python3-venv \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python virtualenv (avoids Debian PEP 668 pip restrictions)
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv ${VIRTUAL_ENV}
ENV PATH="${VIRTUAL_ENV}/bin:${PATH}"

# API dependencies
COPY apps/api/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir --upgrade pip setuptools wheel \
  && pip install --no-cache-dir -r /tmp/requirements.txt

# Web dependencies
COPY apps/web/package*.json /app/apps/web/
RUN cd /app/apps/web && npm install

# Source code
COPY apps/web /app/apps/web
COPY apps/api /app/apps/api
COPY packages /app/packages

# Build web for production start
RUN cd /app/apps/web && npm run build

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PYTHONPATH=/app/apps/api \
    RUN_SERVICE=web \
    PORT=3000

EXPOSE 3000 8000

CMD ["/entrypoint.sh"]
