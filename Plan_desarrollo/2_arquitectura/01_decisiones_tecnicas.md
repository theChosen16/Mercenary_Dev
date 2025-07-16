# Decisiones Técnicas

## Stack Tecnológico

### Frontend
- **Framework**: Flutter
- **Lenguaje**: Dart
- **Gestor de Estado**: Provider
- **Cliente HTTP**: Dio
- **Testing**: Flutter Test

### Backend
- **Framework**: FastAPI (Python)
- **Base de Datos**: PostgreSQL
- **Autenticación**: JWT
- **ORM**: SQLAlchemy
- **Testing**: Pytest

### Infraestructura
- **Hosting**: Por definir
- **CI/CD**: GitHub Actions
- **Contenedorización**: Docker

## Estructura del Proyecto

```
/mercenary
  /backend
    /app
      /api
      /core
      /db
      /models
      /schemas
      /services
  /frontend
    /lib
      /models
      /providers
      /screens
      /services
      /widgets
      /utils
  /docs
  /infra
```

## Estándares de Código
- **Python**: PEP 8
- **Dart**: Effective Dart
- **Commits**: Conventional Commits
- **Branches**: Git Flow

## Decisiones de Diseño
1. **Arquitectura**: Clean Architecture
2. **Patrones de Diseño**: 
   - Repository Pattern
   - Dependency Injection
   - Singleton para servicios clave
3. **Seguridad**: 
   - HTTPS obligatorio
   - Validación de entrada en todos los endpoints
   - Rate limiting

## Próximas Decisiones Pendientes
- [ ] Elección del proveedor de autenticación de terceros (si es necesario)
- [ ] Estrategia de backup de base de datos
- [ ] Plan de monitoreo y alertas
