# Guía de Contribución

¡Gracias por tu interés en contribuir a Mercenary! Esta guía te ayudará a configurar tu entorno de desarrollo y realizar contribuciones de manera efectiva.

## Requisitos Previos

- Git
- Docker y Docker Compose
- Python 3.11+
- Flutter 3.10+
- Node.js 18+ (para algunas herramientas)

## Configuración del Entorno

### Backend

1. Clona el repositorio:
   ```bash
   git clone https://github.com/theChosen16/Mercenary_Dev.git
   cd Mercenary_Dev/backend
   ```

2. Crea un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. Instala las dependencias:
   ```bash
   pip install -r requirements-dev.txt
   ```

4. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

5. Inicia los servicios con Docker:
   ```bash
   docker-compose up -d
   ```

### Frontend

1. Navega al directorio del frontend:
   ```bash
   cd ../frontend
   ```

2. Instala las dependencias de Flutter:
   ```bash
   flutter pub get
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita el archivo .env con tus configuraciones
   ```

## Flujo de Trabajo

1. **Crea una rama** para tu característica o corrección:
   ```bash
   git checkout -b feature/nombre-de-la-caracteristica
   # o
   git checkout -b fix/nombre-del-fix
   ```

2. **Haz commits** siguiendo el formato Conventional Commits:
   ```
   tipo(ámbito): descripción breve

   Descripción más detallada si es necesario
   ```

   Ejemplo:
   ```
   feat(auth): add email verification
   
   - Add email verification endpoint
   - Update registration flow
   - Add tests for email verification
   ```

3. **Envía un Pull Request** a la rama `develop`

## Convenciones de Código

### Python
- Sigue PEP 8
- Usa type hints
- Documenta funciones y clases con docstrings
- Mantén las líneas a un máximo de 88 caracteres (usando Black)

### Dart/Flutter
- Sigue las guías de estilo de Flutter
- Usa nombres descriptivos para widgets
- Separa la lógica de negocio de la UI
- Documenta funciones públicas

## Testing

### Backend
```bash
# Ejecutar todos los tests
pytest

# Ejecutar tests con cobertura
pytest --cov=app tests/

# Ejecutar un archivo de test específico
pytest tests/test_auth.py -v
```

### Frontend
```bash
# Ejecutar tests unitarios
flutter test

# Ejecutar tests de integración
flutter test integration_test/
```

## Revisión de Código

- Todos los PRs requieren al menos una revisión aprobatoria
- Los revisores deben verificar:
  - Cumplimiento de estándares de código
  - Cobertura de pruebas
  - Documentación adecuada
  - Impacto en el rendimiento

## Despliegue

El despliegue a producción se realiza automáticamente desde la rama `main` a través de GitHub Actions. Para desplegar manualmente:

```bash
# Backend
./scripts/deploy.sh production

# Frontend
flutter build web
# Subir los archivos generados a tu proveedor de hosting
```

## Soporte

Si tienes preguntas o necesitas ayuda:
1. Revisa la documentación
2. Busca en los issues existentes
3. Si no encuentras una solución, crea un nuevo issue

¡Gracias por contribuir a Mercenary! 🚀
