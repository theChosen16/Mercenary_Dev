.PHONY: help install test lint format check-style check-types check test-all \
        clean clean-pyc clean-build clean-test clean-all \
        run run-dev run-prod \
        docker-build docker-run docker-push \
        db-init db-upgrade db-downgrade db-revision db-reset \
        init-local init-docker

# Define variables
PROJECT_NAME := mercenary
DOCKER_IMAGE := ${PROJECT_NAME}-backend
DOCKER_TAG := latest
DOCKER_REPOSITORY := your-docker-repo

# Help
help:
	@echo "Available commands:"
	@echo "  install           Install development dependencies"
	@echo "  test              Run tests"
	@echo "  lint              Run linters"
	@echo "  format            Format code with black and isort"
	@echo "  check-style       Check code style"
	@echo "  check-types       Check type annotations"
	@echo "  check             Run all checks (style, types, tests)"
	@echo "  clean             Remove Python file artifacts"
	@echo "  clean-pyc         Remove Python file artifacts"
	@echo "  clean-build       Remove build artifacts"
	@echo "  clean-test        Remove test and coverage artifacts"
	@echo "  clean-all         Remove all build, test, coverage and Python artifacts"
	@echo "  run               Run the application"
	@echo "  run-dev           Run the application in development mode"
	@echo "  run-prod          Run the application in production mode"
	@echo "  docker-build      Build the Docker image"
	@echo "  docker-run        Run the Docker container"
	@echo "  docker-push       Push the Docker image to the registry"
	@echo "  db-init           Initialize the database"
	@echo "  db-upgrade        Upgrade the database"
	@echo "  db-downgrade      Downgrade the database"
	@echo "  db-revision       Create a new migration"
	@echo "  db-reset          Reset the database"
	@echo "  init-local        Initialize local development environment"
	@echo "  init-docker       Initialize Docker development environment"

# Installation
install:
	pip install -r requirements.txt

# Testing
test:
	pytest -v --cov=app --cov-report=term-missing --cov-report=xml:coverage.xml

# Linting
lint:
	flake8 app tests

# Formatting
format:
	black app tests
	isort app tests

# Style checking
check-style:
	black --check app tests
	isort --check-only app tests
	flake8 app tests

# Type checking
check-types:
	mypy app

# Run all checks
check: check-style check-types test

# Cleaning
clean: clean-pyc clean-build clean-test

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

clean-build:
	rm -fr build/
	rm -fr dist/
	rm -fr .eggs/
	find . -name '*.egg-info' -exec rm -fr {} +
	find . -name '*.egg' -exec rm -f {} +

clean-test:
	rm -fr .tox/
	rm -f .coverage
	rm -fr htmlcov/
	rm -fr .pytest_cache
	rm -f coverage.xml

clean-all: clean-build clean-pyc clean-test

# Running the application
run:
	uvicorn app.main:app --host 0.0.0.0 --port 8000

run-dev:
	uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

run-prod:
	gunicorn --worker-class uvicorn.workers.UvicornWorker --workers 4 --bind 0.0.0.0:8000 app.main:app

# Docker
docker-build:
	docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .

docker-run:
	docker run -d --name ${PROJECT_NAME}-backend \
		-p 8000:8000 \
		--env-file .env \
		${DOCKER_IMAGE}:${DOCKER_TAG}

docker-push:
	docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_REPOSITORY}/${DOCKER_IMAGE}:${DOCKER_TAG}
	docker push ${DOCKER_REPOSITORY}/${DOCKER_IMAGE}:${DOCKER_TAG}

# Database
db-init:
	alembic upgrade head

# Database migrations
db-upgrade:
	alembic upgrade +1

db-downgrade:
	alembic downgrade -1

db-revision:
	alembic revision --autogenerate -m "${m}"

db-reset:
	alembic downgrade base && alembic upgrade head

# Initialization
init-local: install db-init
	@echo "Local development environment initialized!"

init-docker:
	docker-compose up -d db redis
	@echo "Waiting for database to be ready..."
	@sleep 5
	docker-compose run --rm web alembic upgrade head
	@echo "Docker development environment initialized!"

# Documentation
docs-serve:
	mkdocs serve

docs-build:
	mkdocs build --clean

docs-deploy:
	mkdocs gh-deploy --clean
