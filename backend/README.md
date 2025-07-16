# Mercenary Backend

Backend API for the Mercenary platform, built with FastAPI and PostgreSQL.

## Features

- **User Authentication**: JWT-based authentication with email/password
- **Role-Based Access Control**: Different roles for clients, freelancers, and admins
- **Project Management**: Create, read, update, and delete projects
- **Proposal System**: Freelancers can submit proposals for projects
- **Skill Management**: Freelancers can add skills to their profile
- **Search & Filtering**: Search for projects and freelancers with various filters
- **File Uploads**: Support for file uploads (e.g., project attachments, profile pictures)

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT
- **Testing**: Pytest
- **Documentation**: OpenAPI (Swagger UI and ReDoc)

## Prerequisites

- Python 3.8+
- PostgreSQL 13+
- pip (Python package manager)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/mercenary.git
cd mercenary/backend
```

### 2. Set up a virtual environment

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set up environment variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# App
APP_NAME=Mercenary
APP_DESCRIPTION="Backend API for Mercenary platform"
APP_VERSION=0.1.0
API_V1_STR=/api/v1
SERVER_NAME=localhost
SERVER_HOST=http://localhost:8000
BACKEND_CORS_ORIGINS=["*"]

# Security
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=60 * 24 * 8  # 8 days

# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=mercenary_dev
SQLALCHEMY_DATABASE_URI=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}/${POSTGRES_DB}

# First Superuser
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=admin123
```

### 5. Set up the database

1. Make sure PostgreSQL is running
2. Create a new database for the application:

```bash
createdb mercenary_dev
```

3. Run migrations:

```bash
alembic upgrade head
```

### 6. Initialize the database with test data (optional)

```bash
python -m app.initial_data
```

### 7. Run the development server

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000

## API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/                      # Application package
│   ├── api/                  # API routes
│   │   └── api_v1/           # API v1 endpoints
│   │       ├── endpoints/    # API endpoints
│   │       └── api.py        # API router
│   ├── core/                 # Core functionality
│   │   ├── config.py         # Application settings
│   │   └── security.py       # Security utilities
│   ├── crud/                 # Database CRUD operations
│   ├── db/                   # Database configuration
│   │   └── migrations/       # Database migrations
│   ├── models/               # SQLAlchemy models
│   ├── schemas/              # Pydantic schemas
│   ├── tests/                # Tests
│   ├── __init__.py
│   ├── deps.py               # Dependencies
│   ├── initial_data.py       # Test data initialization
│   └── main.py               # Application entry point
├── .env.example              # Example environment variables
├── .gitignore
├── alembic.ini               # Alembic configuration
├── requirements.txt          # Project dependencies
└── README.md                 # This file
```

## Running Tests

```bash
pytest
```

## Linting and Formatting

```bash
# Run black code formatter
black .

# Run isort to sort imports
isort .

# Run flake8 for linting
flake8

# Run mypy for type checking
mypy .
```

## Deployment

### Production

1. Set up a production database (e.g., AWS RDS, Google Cloud SQL)
2. Update the environment variables in `.env` with production values
3. Run migrations:

```bash
alembic upgrade head
```

4. Start the production server (using Gunicorn with Uvicorn workers):

```bash
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker

1. Build the Docker image:

```bash
docker build -t mercenary-backend .
```

2. Run the container:

```bash
docker run -d --name mercenary-backend -p 8000:8000 --env-file .env mercenary-backend
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
