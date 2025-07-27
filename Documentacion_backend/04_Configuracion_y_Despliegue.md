# **Guía de Configuración y Despliegue - Backend Mercenary**

## **📋 Información General**

Esta guía detalla cómo configurar, instalar y desplegar el backend de la plataforma Mercenary en diferentes entornos.

---

## **🛠️ Requisitos del Sistema**

### **Requisitos Mínimos**
- **Python**: 3.9+ (recomendado 3.11)
- **PostgreSQL**: 12+ (recomendado 15)
- **RAM**: 2GB mínimo (4GB recomendado)
- **Almacenamiento**: 10GB disponibles
- **CPU**: 2 cores mínimo

### **Herramientas de Desarrollo**
- **Docker**: 20.10+ y Docker Compose 2.0+
- **Git**: Para control de versiones
- **Make**: Para comandos automatizados (opcional)

---

## **⚙️ Variables de Entorno**

### **Archivo `.env` Principal**
```env
# === CONFIGURACIÓN DE LA APLICACIÓN ===
PROJECT_NAME=Mercenary Backend
VERSION=0.1.0
DEBUG=false
API_V1_STR=/api/v1

# === SEGURIDAD ===
SECRET_KEY=tu-clave-secreta-super-segura-de-al-menos-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 días
REFRESH_TOKEN_EXPIRE_DAYS=30

# === BASE DE DATOS ===
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=mercenary_user
POSTGRES_PASSWORD=mercenary_password_segura
POSTGRES_DB=mercenary_db
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://mercenary_user:mercenary_password_segura@localhost:5432/mercenary_db

# === CORS ===
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000","http://localhost:8080"]

# === EMAIL (FUTURO) ===
SMTP_TLS=true
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=noreply@mercenary.com
EMAILS_FROM_NAME=Mercenary Platform

# === LOGGING ===
LOG_LEVEL=INFO
LOG_FILE=debug.log

# === REDIS (FUTURO) ===
REDIS_URL=redis://localhost:6379/0

# === ARCHIVOS Y UPLOADS ===
UPLOAD_FOLDER=uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx

# === PAGOS (FUTURO) ===
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### **Archivo `.env.example`**
```env
# Copia este archivo a .env y configura los valores apropiados

# === CONFIGURACIÓN DE LA APLICACIÓN ===
PROJECT_NAME=Mercenary Backend
VERSION=0.1.0
DEBUG=false
API_V1_STR=/api/v1

# === SEGURIDAD ===
SECRET_KEY=change-this-to-a-secure-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REFRESH_TOKEN_EXPIRE_DAYS=30

# === BASE DE DATOS ===
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=mercenary_db

# === CORS ===
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# === EMAIL ===
SMTP_TLS=true
SMTP_PORT=587
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAILS_FROM_EMAIL=noreply@mercenary.com
EMAILS_FROM_NAME=Mercenary Platform
```

### **Archivo `.env.prod.example` (Producción)**
```env
# === CONFIGURACIÓN DE PRODUCCIÓN ===
PROJECT_NAME=Mercenary Backend
VERSION=0.1.0
DEBUG=false
API_V1_STR=/api/v1
ENVIRONMENT=production

# === SEGURIDAD ===
SECRET_KEY=super-secure-production-secret-key-with-64-characters-minimum
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=11520
REFRESH_TOKEN_EXPIRE_DAYS=30

# === BASE DE DATOS ===
POSTGRES_SERVER=db
POSTGRES_PORT=5432
POSTGRES_USER=mercenary_prod_user
POSTGRES_PASSWORD=super-secure-production-password
POSTGRES_DB=mercenary_prod_db
SQLALCHEMY_DATABASE_URI=postgresql+psycopg2://mercenary_prod_user:super-secure-production-password@db:5432/mercenary_prod_db

# === CORS ===
BACKEND_CORS_ORIGINS=["https://mercenary.com","https://app.mercenary.com","https://api.mercenary.com"]

# === LOGGING ===
LOG_LEVEL=WARNING
LOG_FILE=/app/logs/production.log

# === REDIS ===
REDIS_URL=redis://redis:6379/0

# === MONITOREO ===
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## **🐳 Configuración Docker**

### **Dockerfile Principal**
```dockerfile
FROM python:3.11-slim

# Configurar variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY requirements.txt pyproject.toml ./

# Instalar dependencias Python
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar código de la aplicación
COPY . .

# Crear usuario no-root
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
EXPOSE 8000

# Comando por defecto
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### **Dockerfile.dev (Desarrollo)**
```dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Instalar dependencias del sistema
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
        curl \
        vim \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias Python
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Instalar herramientas de desarrollo
RUN pip install --no-cache-dir \
    pytest \
    pytest-cov \
    black \
    isort \
    flake8 \
    mypy

# Copiar código
COPY . .

EXPOSE 8000

# Comando con recarga automática para desarrollo
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### **docker-compose.yml (Desarrollo)**
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "8000:8000"
    volumes:
      - .:/app
      - /app/venv  # Excluir venv del volumen
    environment:
      - DEBUG=true
      - POSTGRES_SERVER=db
      - POSTGRES_USER=mercenary_user
      - POSTGRES_PASSWORD=mercenary_dev_password
      - POSTGRES_DB=mercenary_dev_db
    depends_on:
      - db
      - redis
    networks:
      - mercenary-network
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=mercenary_user
      - POSTGRES_PASSWORD=mercenary_dev_password
      - POSTGRES_DB=mercenary_dev_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - mercenary-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - mercenary-network
    restart: unless-stopped

  adminer:
    image: adminer:latest
    ports:
      - "8080:8080"
    depends_on:
      - db
    networks:
      - mercenary-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  mercenary-network:
    driver: bridge
```

### **docker-compose.prod.yml (Producción)**
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DEBUG=false
      - POSTGRES_SERVER=db
      - POSTGRES_USER=mercenary_prod_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=mercenary_prod_db
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
      - redis
    networks:
      - mercenary-network
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=mercenary_prod_user
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=mercenary_prod_db
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
    networks:
      - mercenary-network
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mercenary_prod_user -d mercenary_prod_db"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    volumes:
      - redis_prod_data:/data
    networks:
      - mercenary-network
    restart: always
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - web
    networks:
      - mercenary-network
    restart: always

volumes:
  postgres_prod_data:
  redis_prod_data:

networks:
  mercenary-network:
    driver: bridge
```

---

## **🚀 Instalación y Configuración**

### **1. Instalación Local (Desarrollo)**

#### **Paso 1: Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/mercenary-backend.git
cd mercenary-backend
```

#### **Paso 2: Configurar Entorno Virtual**
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

#### **Paso 3: Instalar Dependencias**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

#### **Paso 4: Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus configuraciones
# Asegúrate de configurar al menos:
# - SECRET_KEY
# - POSTGRES_* variables
```

#### **Paso 5: Configurar Base de Datos**
```bash
# Crear base de datos PostgreSQL
createdb mercenary_dev_db

# Ejecutar migraciones
alembic upgrade head

# (Opcional) Cargar datos iniciales
python app/initial_data.py
```

#### **Paso 6: Ejecutar la Aplicación**
```bash
# Desarrollo con recarga automática
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# O usar el script de inicio
python main.py
```

### **2. Instalación con Docker (Recomendado)**

#### **Paso 1: Configurar Variables de Entorno**
```bash
cp .env.example .env
# Editar .env según necesidades
```

#### **Paso 2: Construir y Ejecutar**
```bash
# Construir imágenes
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f web
```

#### **Paso 3: Ejecutar Migraciones**
```bash
# Ejecutar migraciones en el contenedor
docker-compose exec web alembic upgrade head

# Cargar datos iniciales
docker-compose exec web python app/initial_data.py
```

#### **Paso 4: Verificar Instalación**
```bash
# Verificar que todos los servicios estén corriendo
docker-compose ps

# Probar la API
curl http://localhost:8000/
curl http://localhost:8000/docs
```

---

## **🔧 Comandos de Administración**

### **Makefile (Comandos Automatizados)**
```makefile
.PHONY: help install dev test lint format clean docker-build docker-up docker-down migrate

help:  ## Mostrar ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install:  ## Instalar dependencias
	pip install --upgrade pip
	pip install -r requirements.txt

dev:  ## Ejecutar en modo desarrollo
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:  ## Ejecutar tests
	pytest -v --cov=app --cov-report=html

lint:  ## Ejecutar linting
	flake8 app/
	mypy app/

format:  ## Formatear código
	black app/
	isort app/

clean:  ## Limpiar archivos temporales
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	rm -rf .coverage htmlcov/ .pytest_cache/

docker-build:  ## Construir imagen Docker
	docker-compose build

docker-up:  ## Ejecutar con Docker
	docker-compose up -d

docker-down:  ## Detener Docker
	docker-compose down

docker-logs:  ## Ver logs de Docker
	docker-compose logs -f

migrate:  ## Ejecutar migraciones
	alembic upgrade head

migrate-create:  ## Crear nueva migración
	alembic revision --autogenerate -m "$(name)"

reset-db:  ## Resetear base de datos
	python reset_db.py

seed-db:  ## Cargar datos iniciales
	python app/initial_data.py
```

### **Scripts de Utilidad**

#### **reset_db.py**
```python
"""Script para resetear la base de datos."""
import asyncio
from sqlalchemy import text
from app.db.session import engine
from app.db.base_class import Base
from app.models import *  # Importar todos los modelos

async def reset_database():
    """Elimina y recrea todas las tablas."""
    async with engine.begin() as conn:
        # Eliminar todas las tablas
        await conn.run_sync(Base.metadata.drop_all)
        # Recrear todas las tablas
        await conn.run_sync(Base.metadata.create_all)
    
    print("Base de datos reseteada exitosamente")

if __name__ == "__main__":
    asyncio.run(reset_database())
```

#### **check_health.py**
```python
"""Script para verificar el estado del sistema."""
import asyncio
import httpx
from app.core.config import settings

async def check_health():
    """Verifica el estado de la API."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"http://localhost:8000{settings.API_V1_STR}/health")
            if response.status_code == 200:
                print("✅ API está funcionando correctamente")
                print(response.json())
            else:
                print(f"❌ API respondió con código {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando a la API: {e}")

if __name__ == "__main__":
    asyncio.run(check_health())
```

---

## **🗄️ Configuración de Base de Datos**

### **PostgreSQL Setup**

#### **Instalación Local**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS con Homebrew
brew install postgresql
brew services start postgresql

# Windows
# Descargar desde https://www.postgresql.org/download/windows/
```

#### **Configuración Inicial**
```sql
-- Crear usuario
CREATE USER mercenary_user WITH PASSWORD 'mercenary_password';

-- Crear base de datos
CREATE DATABASE mercenary_dev_db OWNER mercenary_user;

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE mercenary_dev_db TO mercenary_user;

-- Configurar extensiones (opcional)
\c mercenary_dev_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

### **Migraciones con Alembic**

#### **Configuración Inicial**
```bash
# Inicializar Alembic (ya hecho)
alembic init migrations

# Configurar alembic.ini
# sqlalchemy.url = postgresql+psycopg2://user:pass@localhost/dbname
```

#### **Comandos Comunes**
```bash
# Ver estado actual
alembic current

# Ver historial
alembic history

# Crear migración automática
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1

# Aplicar migración específica
alembic upgrade <revision_id>
```

---

## **🌐 Despliegue en Producción**

### **1. Servidor VPS/Cloud**

#### **Requisitos del Servidor**
- **OS**: Ubuntu 20.04+ LTS
- **RAM**: 4GB mínimo (8GB recomendado)
- **CPU**: 2 cores mínimo
- **Almacenamiento**: 50GB SSD
- **Ancho de banda**: 1TB/mes

#### **Configuración del Servidor**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
sudo apt install nginx -y

# Configurar firewall
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### **Configuración SSL con Let's Encrypt**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado SSL
sudo certbot --nginx -d api.mercenary.com

# Configurar renovación automática
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### **2. Configuración Nginx**
```nginx
# /etc/nginx/sites-available/mercenary-api
server {
    listen 80;
    server_name api.mercenary.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.mercenary.com;

    ssl_certificate /etc/letsencrypt/live/api.mercenary.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mercenary.com/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Configuración del proxy
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Configuración para archivos estáticos
    location /static/ {
        alias /app/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Límites de tamaño
    client_max_body_size 10M;
}
```

### **3. Despliegue Automatizado**

#### **Script de Despliegue**
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Iniciando despliegue de Mercenary Backend..."

# Variables
REPO_URL="https://github.com/tu-usuario/mercenary-backend.git"
APP_DIR="/opt/mercenary-backend"
BACKUP_DIR="/opt/backups"

# Crear backup de la base de datos
echo "📦 Creando backup de la base de datos..."
mkdir -p $BACKUP_DIR
docker-compose exec -T db pg_dump -U mercenary_prod_user mercenary_prod_db > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql

# Actualizar código
echo "📥 Actualizando código..."
cd $APP_DIR
git pull origin main

# Construir nueva imagen
echo "🔨 Construyendo nueva imagen..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
docker-compose -f docker-compose.prod.yml run --rm web alembic upgrade head

# Reiniciar servicios
echo "🔄 Reiniciando servicios..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d

# Verificar salud
echo "🏥 Verificando salud del sistema..."
sleep 10
curl -f http://localhost:8000/health || exit 1

echo "✅ Despliegue completado exitosamente!"
```

---

## **📊 Monitoreo y Logs**

### **Configuración de Logging**
```python
# logging.conf
[loggers]
keys=root,uvicorn,app

[handlers]
keys=default,access

[formatters]
keys=default,access

[logger_root]
level=INFO
handlers=default

[logger_uvicorn]
level=INFO
handlers=default
qualname=uvicorn
propagate=0

[logger_app]
level=INFO
handlers=default
qualname=app
propagate=0

[handler_default]
formatter=default
class=logging.handlers.RotatingFileHandler
args=('debug.log', 'a', 10485760, 5)

[handler_access]
formatter=access
class=logging.handlers.RotatingFileHandler
args=('access.log', 'a', 10485760, 5)

[formatter_default]
format=%(asctime)s - %(name)s - %(levelname)s - %(message)s

[formatter_access]
format=%(asctime)s - %(client_addr)s - "%(request_line)s" %(status_code)s
```

### **Monitoreo con Docker**
```bash
# Ver logs en tiempo real
docker-compose logs -f web

# Ver métricas de recursos
docker stats

# Ver salud de contenedores
docker-compose ps
```

---

## **🔒 Seguridad**

### **Checklist de Seguridad**
- [ ] **Variables de entorno**: Nunca commitear archivos `.env`
- [ ] **SECRET_KEY**: Usar clave segura de al menos 32 caracteres
- [ ] **HTTPS**: Configurar SSL/TLS en producción
- [ ] **CORS**: Configurar orígenes permitidos correctamente
- [ ] **Rate Limiting**: Implementar límites de velocidad
- [ ] **Input Validation**: Validar todas las entradas
- [ ] **SQL Injection**: Usar ORM y queries parametrizadas
- [ ] **Headers de Seguridad**: Configurar headers apropiados
- [ ] **Backups**: Configurar backups automáticos
- [ ] **Updates**: Mantener dependencias actualizadas

### **Configuración de Seguridad Adicional**
```python
# app/core/security.py
from fastapi import HTTPException, Request
from fastapi.security import HTTPBearer
import time

class RateLimiter:
    def __init__(self, max_requests: int = 100, window: int = 3600):
        self.max_requests = max_requests
        self.window = window
        self.requests = {}
    
    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        if client_ip not in self.requests:
            self.requests[client_ip] = []
        
        # Limpiar requests antiguos
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip]
            if now - req_time < self.window
        ]
        
        # Verificar límite
        if len(self.requests[client_ip]) >= self.max_requests:
            return False
        
        self.requests[client_ip].append(now)
        return True

# Middleware de rate limiting
rate_limiter = RateLimiter()

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")
    return await call_next(request)
```

---

*Documentación generada el 26 de Julio, 2025*
*Versión del Backend: 0.1.0*
