# **📚 Documentación Backend - Mercenary**

## **🎯 Visión General**

Bienvenido a la documentación completa del backend de **Mercenary**, una plataforma de servicios freelance que conecta oferentes con mercenarios especializados. Esta documentación proporciona toda la información necesaria para entender, desarrollar, desplegar y mantener el sistema backend.

---

## **📋 Índice de Documentación**

### **1. [Arquitectura del Backend](01_Arquitectura_Backend.md)**
- Visión general del sistema
- Arquitectura en capas
- Estructura de directorios
- Stack tecnológico
- Esquema de base de datos
- Flujo de autenticación
- Patrones de diseño

### **2. [Modelos de Datos](02_Modelos_de_Datos.md)**
- Modelo User (usuarios del sistema)
- Modelo Announcement (anuncios de trabajo)
- Modelo Contract (contratos entre partes)
- Modelo Transaction (transacciones financieras)
- Modelo Review (sistema de calificaciones)
- Modelo Category (categorización de servicios)
- Relaciones entre modelos
- Consideraciones de rendimiento

### **3. [API Endpoints](03_API_Endpoints.md)**
- Endpoints de autenticación
- Gestión de usuarios
- CRUD de anuncios
- Gestión de contratos
- Sistema de categorías
- Health checks
- Códigos de estado HTTP
- Ejemplos de requests/responses

### **4. [Configuración y Despliegue](04_Configuracion_y_Despliegue.md)**
- Requisitos del sistema
- Variables de entorno
- Configuración con Docker
- Instalación paso a paso
- Despliegue en producción
- Comandos de administración
- Monitoreo y logging
- Checklist de seguridad

### **5. [Desarrollo y Testing](05_Desarrollo_y_Testing.md)**
- Configuración del entorno de desarrollo
- Estándares de código
- Guía de testing
- Flujo de desarrollo con Git
- Métricas de calidad
- CI/CD con GitHub Actions
- Herramientas recomendadas

---

## **🚀 Inicio Rápido**

### **Para Desarrolladores**
1. **Configurar entorno**: Sigue la [guía de desarrollo](05_Desarrollo_y_Testing.md#configuración-del-entorno-de-desarrollo)
2. **Entender la arquitectura**: Revisa la [arquitectura del sistema](01_Arquitectura_Backend.md)
3. **Explorar los modelos**: Familiarízate con los [modelos de datos](02_Modelos_de_Datos.md)
4. **Probar la API**: Usa los [endpoints documentados](03_API_Endpoints.md)

### **Para DevOps**
1. **Configurar infraestructura**: Sigue la [guía de despliegue](04_Configuracion_y_Despliegue.md)
2. **Configurar monitoreo**: Implementa las métricas sugeridas
3. **Establecer CI/CD**: Configura los pipelines de desarrollo

### **Para Product Managers**
1. **Entender el dominio**: Revisa los [modelos de negocio](02_Modelos_de_Datos.md)
2. **Explorar funcionalidades**: Analiza los [endpoints disponibles](03_API_Endpoints.md)
3. **Planificar roadmap**: Consulta las mejoras sugeridas en cada documento

---

## **🏗️ Estado Actual del Proyecto**

### **✅ Completado**
- ✅ Arquitectura base FastAPI
- ✅ Modelos de datos SQLAlchemy
- ✅ Sistema de autenticación JWT
- ✅ Endpoints principales (CRUD)
- ✅ Configuración Docker
- ✅ Migraciones Alembic
- ✅ Documentación Swagger/OpenAPI
- ✅ Tests unitarios básicos

### **🔄 En Desarrollo**
- 🔄 Sistema de pagos y escrow
- 🔄 Notificaciones en tiempo real
- 🔄 Sistema de calificaciones avanzado
- 🔄 Búsqueda y filtros avanzados
- 🔄 Integración con servicios externos

### **📋 Pendiente**
- 📋 Sistema de chat en tiempo real
- 📋 Analytics y métricas de negocio
- 📋 Integración con pasarelas de pago
- 📋 Sistema de disputas
- 📋 API para aplicación móvil

---

## **🛠️ Stack Tecnológico**

### **Backend Core**
- **Framework**: FastAPI 0.104.1
- **Lenguaje**: Python 3.9+
- **Base de Datos**: PostgreSQL 13+
- **ORM**: SQLAlchemy 2.0+
- **Migraciones**: Alembic

### **Autenticación y Seguridad**
- **JWT**: python-jose
- **Hashing**: passlib con bcrypt
- **Validación**: Pydantic v2

### **Desarrollo y Testing**
- **Testing**: pytest
- **Formateo**: black, isort
- **Linting**: flake8, mypy
- **Cobertura**: pytest-cov

### **Infraestructura**
- **Containerización**: Docker
- **Orquestación**: Docker Compose
- **Servidor**: Uvicorn
- **Proxy**: Nginx (producción)

---

## **📞 Contacto y Soporte**

### **Equipo de Desarrollo**
- **Tech Lead**: [Nombre del líder técnico]
- **Backend Developer**: [Desarrollador principal]
- **DevOps Engineer**: [Ingeniero de infraestructura]

### **Recursos Adicionales**
- **Repositorio**: [URL del repositorio]
- **Issues**: [URL de issues en GitHub]
- **Wiki**: [URL de la wiki del proyecto]
- **Slack**: [Canal de comunicación del equipo]

---

## **📄 Licencia y Contribuciones**

Este proyecto está bajo licencia [MIT/Apache/Propietaria]. Para contribuir:

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

---

## **🔄 Historial de Versiones**

| Versión | Fecha | Cambios Principales |
|---------|-------|-------------------|
| 0.1.0 | 2025-01-26 | Versión inicial con funcionalidades básicas |
| 0.0.1 | 2025-01-15 | Setup inicial del proyecto |

---

*Documentación actualizada el 26 de Enero, 2025*  
*Versión del Backend: 0.1.0*  
*Mantenida por: Equipo de Desarrollo Mercenary*
