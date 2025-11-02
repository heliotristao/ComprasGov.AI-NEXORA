FROM python:3.11-slim

WORKDIR /app

# Copiamos apenas os arquivos necessários para instalar as dependências
COPY backend/governance-service/requirements.txt ./requirements.txt

RUN pip install --no-cache-dir -r requirements.txt

# Copiamos o código da aplicação para a imagem final
COPY backend/governance-service/ ./

ENV PORT=80

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]