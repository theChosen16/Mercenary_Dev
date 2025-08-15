# **Guía de Desarrollo y Testing - Backend Mercenary**

## **📋 Información General**

Esta guía detalla las mejores prácticas de desarrollo, testing y contribución al proyecto Mercenary Backend.

---

## **🛠️ Configuración del Entorno de Desarrollo**

### **Requisitos Previos**
- Python 3.9+
- PostgreSQL 12+
- Git
- Docker (opcional pero recomendado)

### **Setup Inicial**
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/mercenary-backend.git
cd mercenary-backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
alembic upgrade head

# Cargar datos iniciales
python app/initial_data.py
```

---

## **📝 Estándares de Código**

### **Formateo y Estilo**
- **Black**: Formateo automático de código
- **Isort**: Organización de imports
- **Flake8**: Linting y detección de errores
- **MyPy**: Verificación de tipos estáticos

### **Comandos de Formateo**
```bash
# Formatear código
black app/
isort app/

# Verificar linting
flake8 app/
mypy app/

# Ejecutar todo junto
make format && make lint
```

### **Configuración de Pre-commit**
```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/psf/black
    rev: 22.3.0
    hooks:
      - id: black
        language_version: python3.9

  - repo: https://github.com/pycqa/isort
    rev: 5.10.1
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 4.0.1
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v0.950
    hooks:
      - id: mypy
```

---

## **🧪 Testing**

### **Estructura de Tests**
```
tests/
├── __init__.py
├── conftest.py              # Configuración pytest
├── test_auth.py            # Tests de autenticación
├── test_users.py           # Tests de usuarios
├── test_announcements.py   # Tests de anuncios
├── test_contracts.py       # Tests de contratos
└── utils/
    ├── __init__.py
    └── test_helpers.py     # Utilidades para tests
```

### **Configuración de Testing**
```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db
from app.db.base_class import Base

# Base de datos de test
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def db_session(db):
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
```

### **Ejemplos de Tests**
```python
# test_auth.py
def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "testpass123",
            "user_type": "MERCENARIO",
            "first_name": "Test",
            "last_name": "User"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login_user(client, db_session):
    # Crear usuario de prueba
    user_data = {
        "email": "test@example.com",
        "password": "testpass123",
        "user_type": "MERCENARIO",
        "first_name": "Test",
        "last_name": "User"
    }
    client.post("/api/v1/auth/register", json=user_data)
    
    # Intentar login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "testpass123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
```

### **Comandos de Testing**
```bash
# Ejecutar todos los tests
pytest

# Tests con cobertura
pytest --cov=app --cov-report=html

# Tests específicos
pytest tests/test_auth.py

# Tests con output detallado
pytest -v -s

# Tests en paralelo
pytest -n auto
```

---

## **🔄 Flujo de Desarrollo**

### **Git Workflow**
```bash
# Crear rama para nueva feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### **Convenciones de Commits**
```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

---

## **📊 Métricas y Calidad**

### **Cobertura de Código**
- **Objetivo**: >80% de cobertura
- **Herramienta**: pytest-cov
- **Reporte**: HTML generado en `htmlcov/`

### **Análisis de Código**
```bash
# Complejidad ciclomática
flake8 --max-complexity=10 app/

# Análisis de seguridad
bandit -r app/

# Análisis de dependencias
safety check
```

---

## **🚀 Despliegue y CI/CD**

### **GitHub Actions**
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.9'
    
    - name: Install dependencies
      run: |
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        pytest --cov=app --cov-report=xml
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

---

## **📚 Recursos Adicionales**

### **Documentación de APIs**
- **Swagger UI**: `/docs`
- **ReDoc**: `/redoc`
- **OpenAPI JSON**: `/api/v1/openapi.json`

### **Herramientas Recomendadas**
- **IDE**: VS Code con extensiones Python
- **Database**: pgAdmin o DBeaver
- **API Testing**: Postman o Insomnia
- **Monitoring**: Sentry para errores

---

*Documentación generada el 26 de Julio, 2025*
*Versión del Backend: 0.1.0*
