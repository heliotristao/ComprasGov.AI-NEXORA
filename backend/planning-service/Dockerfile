FROM python:3.11-slim

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    libxml2-dev \
    libxslt1-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar a biblioteca nexora-auth compartilhada
COPY ./libs/nexora-auth /app/libs/nexora-auth
RUN pip install --no-cache-dir -e /app/libs/nexora-auth

# Instalar dependências do serviço
COPY ./backend/planning-service/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY ./backend/planning-service/app /app/app

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

