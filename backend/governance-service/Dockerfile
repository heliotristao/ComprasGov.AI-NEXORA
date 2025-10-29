FROM python:3.11-slim

WORKDIR /app

COPY backend/governance-service/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/governance-service/app ./app
COPY backend/governance-service/alembic ./alembic
COPY backend/governance-service/alembic.ini ./alembic.ini

ENV PYTHONPATH=/app
ENV PORT=80

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
