# syntax=docker/dockerfile:1.4

# Stage 1: Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.3.2

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install --no-cache-dir 
poetry==

# Copy only requirements to cache them in docker layer
COPY pyproject.toml poetry.lock* ./

# Install dependencies
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root --only main

# Copy the rest of the application code
COPY . .

# Install the project
RUN poetry install --no-interaction --no-ansi --only main

# =======================================

# Stage 2: Runtime stage
FROM python:3.9-slim as runtime

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN addgroup --system appuser && \
    adduser --system --no-create-home --ingroup appuser appuser

# Copy only necessary files from builder
COPY --from=builder /usr/local/lib/python3.9/site-packages /usr/local/lib/python3.9/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /app /app

# Set environment variables
ENV PYTHONPATH=/app \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_ENV=production \
    PATH=/home/appuser/.local/bin:

# Set working directory and user
WORKDIR /app
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD [gunicorn, --worker-class, uvicorn.workers.UvicornWorker, --bind, 0.0.0.0:8000, app.main:app]
