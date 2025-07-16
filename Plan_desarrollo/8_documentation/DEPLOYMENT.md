# Deployment Guide

This guide provides instructions for deploying the Mercenary backend application to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Database Migrations](#database-migrations)
- [Scaling](#scaling)
- [Monitoring](#monitoring)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- Docker and Docker Compose
- Python 3.9+
- PostgreSQL 13+
- Redis 6+
- Git
- Make (optional, but recommended)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# App
APP_NAME=Mercenary
APP_ENV=production
DEBUG=false
SECRET_KEY=your-secret-key-here
API_PREFIX=/api/v1
SERVER_NAME=api.mercenary.example.com
SERVER_HOST=https://api.mercenary.example.com

# CORS
BACKEND_CORS_ORIGINS=["https://mercenary.example.com", "https://www.mercenary.example.com"]

# Database
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mercenary
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}/${POSTGRES_DB}

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# Email
SMTP_TLS=true
SMTP_PORT=587
SMTP_HOST=smtp.example.com
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
EMAILS_FROM_EMAIL=noreply@mercenary.example.com
EMAILS_FROM_NAME=Mercenary

# Frontend
FRONTEND_URL=https://mercenary.example.com

# File Uploads
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json

# Sentry (optional)
SENTRY_DSN=

# Rate Limiting
RATE_LIMIT=1000
RATE_LIMIT_PERIOD=3600  # 1 hour

# Prometheus
PROMETHEUS_MULTIPROC_DIR=/tmp/prometheus
```

## Local Development

### Using Docker Compose (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mercenary.git
   cd mercenary/backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your local configuration.

3. Start the services:
   ```bash
   docker-compose up -d
   ```

4. Run database migrations:
   ```bash
   docker-compose exec web alembic upgrade head
   ```

5. Create initial data (optional):
   ```bash
   docker-compose exec web python -m app.initial_data
   ```

6. Access the application:
   - API: http://localhost:8000/api/v1
   - API Docs: http://localhost:8000/docs
   - PgAdmin: http://localhost:5050
   - MailHog: http://localhost:8025

### Without Docker

1. Install Python 3.9+ and PostgreSQL 13+.

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -e ".[dev]"
   ```

4. Set up the database:
   ```bash
   createdb mercenary
   ```

5. Run migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Staging Environment

1. Set up a server with Docker and Docker Compose.

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mercenary.git
   cd mercenary/backend
   ```

3. Checkout the staging branch:
   ```bash
   git checkout staging
   ```

4. Copy the production environment file:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your staging configuration.

5. Start the services:
   ```bash
   docker-compose -f docker-compose.staging.yml up -d --build
   ```

6. Run database migrations:
   ```bash
   docker-compose -f docker-compose.staging.yml exec web alembic upgrade head
   ```

## Production Environment

### Prerequisites

- Linux server with Docker and Docker Compose
- Domain name with DNS configured
- SSL certificates (recommended: Let's Encrypt)
- Backup solution
- Monitoring and alerting

### Deployment Steps

1. Set up a production server with Docker and Docker Compose.

2. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mercenary.git
   cd mercenary/backend
   ```

3. Checkout the main branch or a specific release tag:
   ```bash
   git checkout main
   # or
   git checkout tags/v1.0.0
   ```

4. Copy the production environment file:
   ```bash
   cp .env.prod.example .env
   ```
   Update the `.env` file with your production configuration.

5. Set proper file permissions:
   ```bash
   chmod 600 .env
   chown -R 1000:1000 .
   ```

6. Start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

7. Run database migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec -T web alembic upgrade head
   ```

8. Set up a reverse proxy (Nginx) with SSL:
   ```nginx
   server {
       listen 80;
       server_name api.mercenary.example.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name api.mercenary.example.com;

       ssl_certificate /etc/letsencrypt/live/api.mercenary.example.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/api.mercenary.example.com/privkey.pem;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /metrics {
           allow 127.0.0.1;
           deny all;
           proxy_pass http://localhost:8000/metrics;
       }
   }
   ```

## Docker Deployment

### Building the Docker Image

1. Build the production image:
   ```bash
   docker build -t mercenary-backend:latest .
   ```

2. Tag and push to a container registry:
   ```bash
   docker tag mercenary-backend:latest yourusername/mercenary-backend:latest
   docker push yourusername/mercenary-backend:latest
   ```

### Running with Docker Compose

1. Create a `docker-compose.prod.yml` file:
   ```yaml
   version: '3.8'

   services:
     web:
       image: yourusername/mercenary-backend:latest
       restart: always
       env_file: .env
       ports:
         - "8000:8000"
       depends_on:
         - db
         - redis
       volumes:
         - uploads:/app/uploads
         - prometheus_data:/tmp/prometheus

     db:
       image: postgres:13-alpine
       restart: always
       env_file: .env
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
         interval: 5s
         timeout: 5s
         retries: 5

     redis:
       image: redis:6-alpine
       restart: always
       command: redis-server --requirepass ${REDIS_PASSWORD}
       volumes:
         - redis_data:/data
       healthcheck:
         test: ["CMD", "redis-cli", "ping"]
         interval: 5s
         timeout: 3s
         retries: 5

     prometheus:
       image: prom/prometheus:latest
       restart: always
       ports:
         - "9090:9090"
       volumes:
         - ./prometheus:/etc/prometheus
         - prometheus_data:/prometheus
       command:
         - '--config.file=/etc/prometheus/prometheus.yml'
         - '--storage.tsdb.path=/prometheus'
         - '--web.console.libraries=/usr/share/prometheus/console_libraries'
         - '--web.console.templates=/usr/share/prometheus/consoles'

     grafana:
       image: grafana/grafana:latest
       restart: always
       ports:
         - "3000:3000"
       volumes:
         - grafana_data:/var/lib/grafana
       environment:
         - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}

   volumes:
     postgres_data:
     redis_data:
     prometheus_data:
     grafana_data:
   ```

2. Start the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- kubectl configured to access the cluster
- Helm (for managing releases)

### Deploying with Helm

1. Create a values.yaml file:
   ```yaml
   replicaCount: 3

   image:
     repository: yourusername/mercenary-backend
     tag: latest
     pullPolicy: IfNotPresent

   env:
     - name: APP_ENV
       value: "production"
     - name: DATABASE_URL
       valueFrom:
         secretKeyRef:
           name: mercenary-secrets
           key: database-url
     # Add other environment variables as needed

   service:
     type: ClusterIP
     port: 8000

   ingress:
     enabled: true
     hosts:
       - host: api.mercenary.example.com
         paths: ["/"]
     tls:
       - secretName: mercenary-tls
         hosts:
           - api.mercenary.example.com

   resources:
     limits:
       cpu: 1000m
       memory: 1024Mi
     requests:
       cpu: 500m
       memory: 512Mi
   ```

2. Install the chart:
   ```bash
   helm install mercenary ./charts/mercenary -f values.yaml
   ```

## Database Migrations

### Creating Migrations

1. Make changes to your models in `app/models/`.

2. Generate a new migration:
   ```bash
   alembic revision --autogenerate -m "Description of changes"
   ```

3. Review the generated migration file in `app/db/migrations/versions/`.

### Applying Migrations

1. Apply all pending migrations:
   ```bash
   alembic upgrade head
   ```

2. Rollback the last migration:
   ```bash
   alembic downgrade -1
   ```

## Scaling

### Horizontal Scaling

1. Scale the web service:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --scale web=3
   ```

2. Use a load balancer to distribute traffic.

### Database Scaling

1. Set up read replicas for read-heavy workloads.
2. Configure connection pooling with PgBouncer.

## Monitoring

### Prometheus and Grafana

1. Access Prometheus: http://localhost:9090
2. Access Grafana: http://localhost:3000 (admin/admin)
3. Import the following dashboards:
   - Node Exporter Full (ID: 1860)
   - PostgreSQL (ID: 9628)
   - Redis (ID: 763)

### Logging

1. View logs:
   ```bash
   docker-compose logs -f web
   ```

2. Set up log aggregation with ELK or Loki.

## Backup and Recovery

### Database Backups

1. Create a daily backup:
   ```bash
   docker-compose exec -T db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d).sql
   ```

2. Restore from backup:
   ```bash
   cat backup_20230715.sql | docker-compose exec -T db psql -U $POSTGRES_USER $POSTGRES_DB
   ```

### File Backups

1. Backup the uploads directory:
   ```bash
   tar -czvf uploads_backup_$(date +%Y%m%d).tar.gz ./uploads
   ```

## Troubleshooting

### Common Issues

1. **Database connection refused**
   - Check if the database is running
   - Verify the connection string in `.env`
   - Check database logs: `docker-compose logs db`

2. **Migrations not applying**
   - Make sure the database exists
   - Check for merge conflicts in migration files
   - Run `alembic stamp head` to mark the database as up to date

3. **Container won't start**
   - Check logs: `docker-compose logs web`
   - Verify environment variables
   - Check for port conflicts

4. **Slow performance**
   - Check database queries with `EXPLAIN ANALYZE`
   - Enable slow query logging
   - Check system resources with `docker stats`

## Maintenance

### Updating the Application

1. Pull the latest changes:
   ```bash
   git pull
   ```

2. Rebuild and restart the services:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. Apply any new migrations:
   ```bash
   docker-compose -f docker-compose.prod.yml exec -T web alembic upgrade head
   ```

### Database Maintenance

1. Run VACUUM ANALYZE:
   ```bash
   docker-compose exec db psql -U $POSTGRES_USER $POSTGRES_DB -c "VACUUM ANALYZE;"
   ```

2. Reindex the database:
   ```bash
   docker-compose exec db psql -U $POSTGRES_USER $POSTGRES_DB -c "REINDEX DATABASE $POSTGRES_DB;"
   ```

## Security Hardening

1. Update all dependencies regularly
2. Use strong passwords and API keys
3. Enable firewall and limit access
4. Use HTTPS with HSTS
5. Set secure headers
6. Regular security audits

## Support

For support, please contact:
- **Email**: support@mercenary.example.com
- **Slack**: #mercenary-support
- **GitHub Issues**: https://github.com/yourusername/mercenary/issues
