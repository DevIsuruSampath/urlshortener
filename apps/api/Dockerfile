FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY alembic.ini ./alembic.ini
COPY start.sh ./start.sh
RUN chmod +x ./start.sh
ENV PYTHONPATH=/app
EXPOSE 8000
CMD ["./start.sh"]
