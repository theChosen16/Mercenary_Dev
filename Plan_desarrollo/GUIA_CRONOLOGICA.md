# 🚀 Guía Cronológica de Desarrollo - Plataforma Mercenary

*Última actualización: 22 de Julio de 2025*

## 📋 Resumen Ejecutivo

Este documento detalla la hoja de ruta de desarrollo de la plataforma Mercenary, un marketplace que conecta a Oferentes con Mercenarios para la prestación de servicios profesionales. La guía sigue una estructura ágil con hitos claramente definidos para garantizar una implementación exitosa.

## 📊 Visión General del Proyecto

- **Objetivo Principal**: Crear una plataforma segura y confiable para la contratación de servicios profesionales con sistema de depósito en garantía.
- **Stack Tecnológico**: 
  - **Backend**: Python (FastAPI), PostgreSQL, Redis
  - **Frontend**: React.js, TypeScript, TailwindCSS
    - *Decisión de Arquitectura*: Se ha seleccionado React.js sobre Flutter para aprovechar la experiencia del equipo y el ecosistema existente
  - **API**: RESTful con versionado (/api/v1/)
    - Todos los endpoints siguen el patrón `/api/v1/{recurso}`
    - Autenticación mediante JWT con refresh tokens
  - **Infraestructura**: Docker, AWS, GitHub Actions
- **Patrones Clave**:
  - Flujo de autenticación unificado con JWT
  - Estructura de rutas consistente
  - Manejo de errores estandarizado
- **Equipo**: Equipo ágil multidisciplinario siguiendo metodologías Scrum

## 🎯 Fase 1: Planificación y Diseño (Julio 2025) ✅

### 📌 Objetivos Principales

- [x] Definir la visión estratégica del proyecto y propuesta de valor
- [x] Establecer la arquitectura técnica escalable
- [x] Crear los diseños de UI/UX centrados en el usuario
- [x] Documentar los requisitos legales y de cumplimiento
- [x] Definir métricas de éxito y KPI's

### ✅ Tareas Completadas

#### Estrategia y Análisis
- [x] Definición de la visión estratégica
- [x] Análisis detallado de mercado y competencia
- [x] Definición de la propuesta de valor única
- [x] Identificación de buyer personas y user journeys

#### Diseño Técnico
- [x] Arquitectura de microservicios definida
- [x] Diseño de la base de datos relacional
- [x] Definición de la API RESTful
- [x] Estrategia de autenticación y autorización

#### Diseño UI/UX
- [x] Wireframes de baja fidelidad
- [x] Diseño de alta fidelidad (Figma)
- [x] Guía de estilos y componentes
- [x] Prototipos interactivos

#### Documentación
- [x] Términos y condiciones
- [x] Política de privacidad
- [x] Acuerdo de nivel de servicio (SLA)
- [x] Documentación técnica inicial

## 🛠️ Fase 2: Desarrollo MVP (Agosto - Septiembre 2025)

### 📊 Progreso Actual (Semana del 15-21 de Julio 2025)

#### 📌 Estado Actual del Desarrollo

#### Configuración Inicial
- [x] Revisión y aprobación de la documentación técnica
- [x] Estructura de carpetas y convenciones de código
- [x] Configuración de herramientas de desarrollo
  - [x] Linters y formateadores (Black, isort, flake8)
  - [x] Configuración de pre-commit hooks
  - [x] Plantillas de pull requests y commits

#### Infraestructura
- [x] Configuración de entornos (dev, staging, prod)
- [x] Configuración de Docker y docker-compose
- [x] Base de datos PostgreSQL con migraciones
- [x] Configuración de Redis para caché y colas
#### Autenticación y Autorización
- [x] Sistema de autenticación JWT
  - [x] Registro con verificación por email
  - [x] Inicio de sesión seguro
  - [x] Refresh tokens
  - [x] Endpoints protegidos
  - [x] Sistema de roles (ADMIN, MERCENARY, OFFERER)
- [x] Middleware de autorización
- [x] Manejo de sesiones seguras
- [x] Protección contra ataques comunes (CSRF, XSS, etc.)
#### Base de Datos
- [x] Modelo de Usuarios
  - [x] Estructura de perfiles de usuario
  - [x] Roles y permisos
  - [x] Validación de datos
- [x] Migraciones con Alembic
  - [x] Scripts de migración
  - [x] Rollback seguro
  - [x] Datos semilla iniciales
- [x] Índices y optimizaciones
- [x] Backup y recuperación
#### Gestión de Perfiles
- [x] Modelo completo de perfiles
  - [x] Información personal
  - [x] Habilidades y especialidades
  - [x] Historial laboral
  - [x] Portafolio y certificaciones
- [x] Endpoints CRUD
  - [x] Creación y actualización
  - [x] Validación de datos
  - [x] Subida de archivos (CV, portafolio)
  - [x] Búsqueda y filtrado

#### Sistema de Trabajos

- [x] **Modelo de Trabajos**
  ```typescript
  interface Job {
    id: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    category: string;
    tags: string[];
    budget: {
      min: number;
      max: number;
      currency: string;
    };
    deadline: string; // ISO date
    offerer_id: string; // Relación con Oferente
    created_at: string;
    updated_at: string;
  }
  ```

- [x] **Endpoints**
  - `GET /api/v1/jobs` - Listar trabajos (con filtros)
  - `POST /api/v1/jobs` - Crear nuevo trabajo
  - `GET /api/v1/jobs/{job_id}` - Detalles de trabajo
  - `PUT /api/v1/jobs/{job_id}` - Actualizar trabajo
  - `DELETE /api/v1/jobs/{job_id}` - Eliminar trabajo
  - `GET /api/v1/jobs/{job_id}/proposals` - Listar propuestas
  - `POST /api/v1/jobs/{job_id}/proposals` - Enviar propuesta

- [x] **Validaciones**
  - [x] Solo el oferente puede modificar/eliminar sus trabajos
  - [x] Validación de presupuesto y fechas
  - [x] Filtrado avanzado por categoría, habilidades, ubicación, etc.
- [x] Gestión de trabajos
  - [x] Publicación y edición
  - [x] Postulación de mercenarios
  - [x] Asignación y seguimiento
  - [x] Sistema de ofertas y contratación

#### Documentación

- [x] **Documentación de la API**
  - [x] Esquemas OpenAPI/Swagger
  - [x] Documentación interactiva
  - [x] Ejemplos de código
  - [x] Guías de integración

- [x] **Documentación Técnica**
  - [x] Guía de instalación
  - [x] Configuración de entorno
  - [x] Guía de contribución

- [x] **Documentación para Usuarios Finales**
  - [x] Guías de inicio rápido
  - [x] Preguntas frecuentes
  - [x] Tutoriales en video

## 🚀 Próximos Pasos Inmediatos (Sprint Actual)

#### Prioridad Alta (Sprint Actual)
- [ ] **Sistema de Contratos y Pagos**
  - [ ] Integración con pasarela de pagos
  - [ ] Implementación de depósito en garantía (Escrow)
  - [ ] Flujo de liberación de fondos
  - [ ] Historial de transacciones

- [ ] **Sistema de Reseñas y Calificaciones**
  - [ ] Modelo de reseñas
  - [ ] Sistema de calificación por estrellas
  - [ ] Comentarios verificados
  - [ ] Cálculo de reputación

#### Prioridad Media (Próximo Sprint)
- [ ] **Notificaciones en Tiempo Real**
  - [ ] WebSockets para notificaciones push
  - [ ] Plantillas de notificaciones
  - [ ] Preferencias de notificación

- [ ] **Paneles de Control**
  - [ ] Dashboard de Oferente
  - [ ] Dashboard de Mercenario
  - [ ] Panel de Administración

#### Prioridad Baja
- [ ] **Mejoras de Rendimiento**
  - [ ] Caché de consultas frecuentes
  - [ ] Optimización de consultas
  - [ ] Monitoreo de rendimiento

## 🔧 Detalles Técnicos

### 🖥️ Backend

#### Autenticación y Seguridad

- [x] **Esquemas y Modelos**
  - [x] Modelo de Usuario con roles (ADMIN, MERCENARY, OFFERER)
  - [x] Tokens JWT con expiración (15 min para access token)
  - [x] Refresh tokens (7 días de duración)
  - [x] Intento de inicio de sesión con protección contra fuerza bruta
  - [x] Endpoint de refresh token implementado en `/api/v1/auth/refresh`

- [x] **Endpoints**
  - [x] `/api/v1/auth/register` - Registro de usuarios
  - [x] `/api/v1/auth/login` - Inicio de sesión
  - [x] `/api/v1/auth/refresh` - Renovación de token
  - [x] `/api/v1/auth/me` - Información del usuario actual

- [x] **Seguridad**
  - [x] Validación de entrada
  - [x] Rate limiting
  - [x] Protección contra ataques de fuerza bruta
  - [x] Headers de seguridad HTTP

- [ ] **Pruebas**
  - [x] Pruebas de integración
  - [ ] Pruebas unitarias
  - [ ] Pruebas de seguridad

#### Núcleo de la API

- [x] **Modelos de Datos**
  - [x] Usuarios y Perfiles
  - [x] Trabajos y Propuestas
  - [x] Contratos y Pagos
  - [x] Reseñas y Calificaciones
  - [x] Habilidades y Categorías

- [x] **Endpoints Principales**
  - [x] `/api/v1/users` - Gestión de usuarios
  - [x] `/api/v1/profiles` - Perfiles de usuario
  - [x] `/api/v1/jobs` - Publicación de trabajos
  - [x] `/api/v1/proposals` - Propuestas de trabajo
  - [ ] `/api/v1/contracts` - Gestión de contratos
  - [ ] `/api/v1/messages` - Sistema de mensajería
  - [ ] `/api/v1/reviews` - Reseñas y calificaciones

- [x] **Características**
  - [x] Validación de datos con Pydantic
  - [x] Paginación y ordenamiento
  - [x] Filtrado avanzado
  - [x] Búsqueda por texto completo

#### Base de Datos

- [x] **Configuración**
  - [x] PostgreSQL 14+
  - [x] Extensión UUID
  - [x] Índices optimizados
  - [x] Particionamiento para tablas grandes

- [x] **Migraciones**
  - [x] Sistema de migraciones con Alembic
  - [x] Scripts de migración automáticos
  - [x] Rollback de migraciones
  - [x] Datos semilla iniciales

- [ ] **Optimización**
  - [ ] Índices para consultas frecuentes
  - [ ] Particionamiento de tablas
  - [ ] Réplicas de lectura
  - [ ] Monitoreo de consultas lentas

- [ ] **Seguridad**
  - [x] Encriptación de datos sensibles
  - [ ] Máscara de datos en entornos no productivos
  - [ ] Auditoría de cambios

#### Despliegue e Infraestructura

- [x] **Entornos**
  - [x] Desarrollo
  - [ ] Staging
  - [ ] Producción

- [ ] **CI/CD**
  - [ ] GitHub Actions para integración continua
  - [ ] Despliegue automático en staging
  - [ ] Despliegue manual en producción
  - [ ] Rollback automático en fallos

- [ ] **Monitoreo**
  - [ ] Logs centralizados
  - [ ] Métricas de rendimiento
  - [ ] Alertas automáticas
  - [ ] Dashboard de estado

- [ ] **Escalabilidad**
  - [ ] Balanceo de carga
  - [ ] Autoescalado
  - [ ] CDN para activos estáticos

#### Sistema de Reputación

- [ ] **Algoritmo de Calificación**
  - [ ] Ponderación por tipo de trabajo
  - [ ] Decaimiento de calificaciones antiguas
  - [ ] Detección de patrones sospechosos

- [ ] **Endpoints**
  - [ ] `/api/v1/ratings` - Enviar calificación
  - [ ] `/api/v1/reputation` - Obtener reputación
  - [ ] `/api/v1/leaderboard` - Clasificación de mercenarios

- [ ] **Características**
  - [ ] Insignias por logros
  - [ ] Niveles de experiencia
  - [ ] Estadísticas detalladas
  - [ ] Sistema de recompensas

### Frontend

#### Configuración
- [x] **Estructura del Proyecto**
  - [x] Organización por características
  - [x] Configuración de rutas
  - [x] Gestión de estado (Redux Toolkit)
  - [x] Configuración de estilos (TailwindCSS)

- [ ] **Entornos**
  - [ ] Variables de entorno por ambiente
  - [ ] Configuración de API endpoints
  - [ ] Feature flags

- [ ] **CI/CD**
  - [ ] Pruebas unitarias
  - [ ] Pruebas E2E
  - [ ] Despliegue automático
  - [ ] Optimización de assets

#### Sistema de Diseño

- [ ] **Componentes Base**
  - [ ] Botones y controles de formulario
  - [ ] Tarjetas y contenedores
  - [ ] Modales y notificaciones
  - [ ] Tablas y listas

- [ ] **Temas**
  - [ ] Tema claro/oscuro
  - [ ] Paleta de colores
  - [ ] Tipografía
  - [ ] Espaciado y grid

- [ ] **Biblioteca de Componentes**
  - [ ] Documentación interactiva
  - [ ] Pruebas visuales
  - [ ] Accesibilidad (a11y)
  - [ ] Internacionalización (i18n)

#### Pantallas Principales

- [ ] **Autenticación**
  - [ ] Inicio de sesión
  - [ ] Registro
  - [ ] Recuperación de contraseña
  - [ ] Verificación de email

- [ ] **Dashboard**
  - [ ] Resumen de actividad
  - [ ] Trabajos recientes
  - [ ] Notificaciones
  - [ ] Estadísticas rápidas

- [ ] **Explorar Trabajos**
  - [ ] Listado con filtros
  - [ ] Búsqueda avanzada
  - [ ] Vista detallada
  - [ ] Guardar favoritos

- [ ] **Perfil de Usuario**
  - [ ] Información personal
  - [ ] Portafolio
  - [ ] Historial de trabajos
  - [ ] Reseñas y calificaciones

- [ ] **Gestión de Trabajos**
  - [ ] Publicar nuevo trabajo
  - [ ] Gestionar publicaciones
  - [ ] Revisar propuestas
  - [ ] Seguimiento de progreso

## 🚀 Fase 3: Pruebas y Lanzamiento (Octubre 2025)

### 🧪 Estrategia de Pruebas

#### Pruebas Automatizadas
- [ ] **Pruebas Unitarias**
  - [ ] Cobertura >80%
  - [ ] Pruebas de componentes
  - [ ] Pruebas de utilidades

- [ ] **Pruebas de Integración**
  - [ ] Flujos completos de usuario
  - [ ] Integración con servicios externos
  - [ ] Pruebas de API

- [ ] **Pruebas de Rendimiento**
  - [ ] Pruebas de carga
  - [ ] Pruebas de estrés
  - [ ] Análisis de cuellos de botella

- [ ] **Pruebas de Seguridad**
  - [ ] Análisis estático de código
  - [ ] Pruebas de penetración
  - [ ] Auditoría de seguridad

### 🎯 Lanzamiento Controlado

#### Preparación
- [ ] **Plan de Lanzamiento**
  - [ ] Cronograma detallado
  - [ ] Plan de comunicación
  - [ ] Rollback plan

- [ ] **Documentación**
  - [ ] Guía de usuario
  - [ ] Preguntas frecuentes
  - [ ] Tutoriales en video

#### Ejecución
- [ ] **Despliegue por Fases**
  - [ ] Beta cerrada
  - [ ] Lanzamiento por regiones
  - [ ] Monitoreo en tiempo real

- [ ] **Soporte**
  - [ ] Equipo de soporte preparado
  - [ ] Canales de comunicación
  - [ ] Base de conocimiento

## 📈 Fase 4: Crecimiento y Mejora Continua (Noviembre 2025 en adelante)

### 🔄 Mejora Continua

#### Análisis y Retroalimentación
- [ ] **Métricas de Uso**
  - [ ] Tasa de conversión
  - [ ] Tiempo en plataforma
  - [ ] Retención de usuarios
  - [ ] NPS (Net Promoter Score)

- [ ] **Feedback de Usuarios**
  - [ ] Encuestas de satisfacción
  - [ ] Sesiones de usuario
  - [ ] Análisis de soporte

#### Optimizaciones
- [ ] **Rendimiento**
  - [ ] Tiempo de carga
  - [ ] Uso de recursos
  - [ ] Optimización de consultas

- [ ] **Experiencia de Usuario**
  - [ ] Flujos de usuario
  - [ ] Diseño responsivo
  - [ ] Accesibilidad

### 🌍 Expansión

#### Internacionalización
- [ ] Soporte para múltiples idiomas
- [ ] Localización de contenido
- [ ] Monedas y formatos regionales

#### Integraciones
- [ ] Pasarelas de pago adicionales
- [ ] Herramientas de productividad
- [ ] Redes sociales

#### Nuevos Mercados
- [ ] Expansión geográfica
- [ ] Nuevas verticales de negocio
- [ ] Asociaciones estratégicas

## 📊 Estado Actual del Proyecto (Julio 2025)

### ✅ Completado
- [x] **Planificación y Diseño**
  - [x] Documentación técnica completa
  - [x] Diseños de UI/UX finalizados
  - [x] Arquitectura del sistema definida

- [x] **Desarrollo Backend**
  - [x] Configuración inicial del proyecto
  - [x] Sistema de autenticación JWT
  - [x] Modelos de datos principales
  - [x] API RESTful documentada

- [x] **Infraestructura**
  - [x] Entorno de desarrollo configurado
  - [x] Base de datos PostgreSQL
  - [x] Sistema de migraciones

### 🚧 En Progreso

#### Desarrollo Backend
- [ ] Sistema de contratos y pagos
- [ ] Sistema de mensajería
- [ ] Notificaciones en tiempo real

#### Frontend
- [ ] Pantalla de inicio de sesión/registro
- [ ] Dashboard principal
- [ ] Gestión de perfiles

### 📅 Próximos Pasos

#### Prioridad Alta
1. Implementar sistema de pagos con depósito en garantía
2. Desarrollar sistema de mensajería entre usuarios
3. Crear paneles de control personalizados

#### Prioridad Media
1. Implementar notificaciones push
2. Desarrollar sistema de búsqueda avanzada
3. Crear sistema de informes y análisis

### ⚠️ Riesgos y Dependencias

#### Riesgos Identificados
1. **Técnicos**
   - Complejidad en la integración de pagos
   - Rendimiento con alto volumen de usuarios
   - Seguridad de datos sensibles

2. **De Proceso**
   - Cumplimiento de plazos ajustados
   - Coordinación entre equipos
   - Gestión de cambios en requisitos

#### Plan de Mitigación
- Reuniones diarias de sincronización
- Pruebas continuas de integración
- Monitoreo proactivo de riesgos
- Comunicación constante con stakeholders

## 📊 Métricas Clave de Seguimiento

### 🛠️ Desarrollo
- **Velocidad del Equipo**
  - Story points completados por sprint
  - Tareas terminadas vs. planificadas
  - Capacidad de entrega

- **Calidad del Código**
  - Cobertura de pruebas (%)
  - Deuda técnica identificada
  - Vulnerabilidades de seguridad
  - Tasa de reintentos de CI/CD

- **Eficiencia**
  - Tiempo medio de resolución de incidencias
  - Tasa de reapertura de tickets
  - Tiempo de ciclo de desarrollo

### 👥 Usuarios
- **Adopción**
  - Usuarios registrados
  - Usuarios activos diarios/mensuales
  - Tasa de crecimiento

- **Compromiso**
  - Tiempo en la plataforma
  - Frecuencia de uso
  - Profundidad de interacción

- **Retención**
  - Tasa de retención a 7/30/90 días
  - Tasa de abandono
  - Frecuencia de retorno

### 💰 Negocio
- **Conversión**
  - Tasa de registro a perfil completo
  - Tasa de publicación de trabajos
  - Tasa de contratación

- **Ingresos**
  - Ingreso mensual recurrente (MRR)
  - Valor de por vida del cliente (LTV)
  - Costo de adquisición de cliente (CAC)

### 📈 Rendimiento Técnico
- **Sistema**
  - Tiempo de actividad (uptime)
  - Tiempo de respuesta de la API
  - Tasa de errores

- **Infraestructura**
  - Uso de CPU/Memoria
  - Latencia de base de datos
  - Tiempo de respuesta del CDN

2. **Negocio**
   - Número de usuarios registrados
   - Tasa de conversión de visitantes a usuarios
   - Ingresos recurrentes mensuales (MRR)

3. **Calidad**
   - Puntuación media de satisfacción de usuarios
   - Tiempo de actividad del servicio
   - Tiempo de respuesta de la API

## 🔍 Próximos Pasos Recomendados

1. **Corto Plazo (2 semanas)**
   - Completar el sistema de autenticación
   - Desarrollar los primeros prototipos de pantallas
   - Configurar la integración continua

2. **Mediano Plazo (1-2 meses)**
   - Completar el desarrollo del MVP
   - Iniciar pruebas internas
   - Preparar documentación para desarrolladores

3. **Largo Plazo (3-6 meses)**
   - Lanzamiento de la versión beta
   - Implementar sistema de pagos
   - Iniciar estrategia de adquisición de usuarios

---
*Última actualización: 18 de Julio de 2025*
