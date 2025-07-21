# **Plan de Ejecución Técnica: Plataforma de Mercenarios (MVP)**

Este documento detalla los pasos técnicos iniciales para el desarrollo de la plataforma, desde la configuración del entorno hasta las primeras tareas de desarrollo del backend y la base de datos para el Producto Mínimo Viable (MVP).

---

## **1. Configuración del Entorno de Desarrollo** ✅

Para asegurar un flujo de trabajo estandarizado y eficiente, se deben instalar y configurar las siguientes herramientas.

### **1.1. Frontend: Flutter y Android Studio**  (Pendiente)

- [X] **Instalar Flutter SDK**: Seguir la [guía oficial de instalación de Flutter](https://flutter.dev/docs/get-started/install) para el sistema operativo correspondiente.
- [X] **Instalar Android Studio**: Descargar e instalar [Android Studio](https://developer.android.com/studio). Configurar el SDK de Android y crear un emulador (AVD) para las pruebas.
- [X] **Plugins**: Instalar los plugins de `Flutter` y `Dart` en Android Studio desde el Marketplace.
- [X] **Verificación**: Ejecutar `flutter doctor` en la terminal para confirmar que todos los componentes están instalados y configurados correctamente.

### **1.2. Backend: Python y FastAPI** ✅

- [x] **Python 3.11+** instalado y configurado.
- [x] **Entorno virtual** creado y activado.
- [x] **Dependencias principales** instaladas:

  ```text
  fastapi
  uvicorn[standard]
  sqlalchemy
  psycopg2-binary
  passlib[bcrypt]
  python-jose[cryptography]
  python-multipart
  pydantic[email]
  pydantic-settings
  python-dotenv
  ```

- [x] **Estructura del proyecto** inicial configurada con módulos básicos.

### **1.3. Base de Datos: PostgreSQL** ✅

- [x] **PostgreSQL** instalado y en ejecución.
- [x] **Base de datos** `mercenary_db` creada.
- [x] **Usuario** configurado con los permisos necesarios.
- [x] **Conexión** exitosa desde la aplicación FastAPI.

### **1.4. Contenerización: Docker** ✅

- [x] **Docker Desktop** instalado.
- [x] **Dockerfile** para la aplicación FastAPI implementado con:
  - Imagen base `python:3.11-slim`
  - Instalación de dependencias con `pip`
  - Variables de entorno para configuración
  - Health check para monitoreo
- [x] **docker-compose.yml** implementado con:
  - Servicio `backend` (FastAPI)
  - Servicio `db` (PostgreSQL 13-alpine)
  - Volúmenes persistentes para datos
  - Variables de entorno separadas por entorno

#### **Diferencias entre entornos**

| Configuración          | Desarrollo Local          | Producción (Docker)         |
|------------------------|---------------------------|------------------------------|
| **Base de datos**      | PostgreSQL local          | Contenedor PostgreSQL        |
| **Variables**          | .env file                 | docker-compose.yml           |
| **Dependencias**       | Instaladas en venv        | Incluidas en imagen Docker   |
| **Puertos**            | 8000 (API), 5432 (DB)     | Mapeados a puertos host      |
| **Persistencia**       | Datos en localhost        | Volúmenes Docker             |

*Nota: El entorno de desarrollo puede seguir usando PostgreSQL local para mayor velocidad, mientras que producción usa la configuración contenerizada.*

---

## **2. Diseño de UI/UX (Prototipado Visual)** ⏳ (Pendiente)

El diseño visual definirá la experiencia del usuario. Se utilizará una herramienta como **Figma** para crear los wireframes y mockups de alta fidelidad.

- [ ] Diseñar pantallas clave en Figma.
- [ ] Obtener retroalimentación y refinar los diseños.
- [ ] Exportar assets necesarios para el desarrollo frontend.

### **Pantallas Clave del MVP**

1. **Flujo de Registro/Login**:
   - Pantalla de bienvenida con opciones de registro y login.
   - Formulario de registro diferenciado para **Oferentes** y **Mercenarios**.
   - Pantalla de inicio de sesión.
2. **Tablón de Anuncios**: Vista principal con la lista de trabajos publicados, con filtros básicos (categoría, ubicación).
3. **Detalle del Anuncio**: Vista detallada de una oferta de trabajo.
4. **Perfil de Usuario**: Perfil público (visible para otros) y perfil privado (para gestionar datos personales y configuraciones).
5. **Formulario de Publicación de Anuncio**: Formulario para que los Oferentes creen nuevas ofertas de trabajo.
6. **Sistema de Calificación**: Pantalla para que los usuarios dejen una calificación y reseña después de un trabajo completado.

---

## **3. Desarrollo del Backend (Sprint 1)** 🚧

### **Progreso Actual**

✅ **Estructura del Proyecto**

- [x] Arquitectura modular en `app/` siguiendo las mejores prácticas de FastAPI
- [x] Modelos en `app/models/`: `user.py`, `job.py`, `profile.py`
- [x] Esquemas Pydantic en `app/schemas/`
- [x] Lógica de negocio en `app/crud/`
- [x] Rutas de la API en `app/api/` con versionado
- [x] Configuración centralizada con `config.py`
- [x] Base de datos configurada con SQLAlchemy y Alembic

✅ **Autenticación JWT**

- [x] `POST /api/v1/auth/token`: Genera tokens JWT (acceso y refresh)
- [x] `POST /api/v1/auth/refresh`: Renueva el token de acceso
- [x] Middleware de autenticación con OAuth2PasswordBearer
- [x] Hasheo seguro de contraseñas con `bcrypt`
- [x] Validación de tokens JWT con python-jose
- [x] Manejo de roles de usuario (ADMIN, MERCENARY, OFFERER)
- [x] Funciones de utilidad para verificación de permisos

✅ **Endpoints de Usuarios**

- [x] `POST /api/v1/users/`: Registro de nuevos usuarios
- [x] `GET /api/v1/users/me/`: Obtener perfil del usuario autenticado
- [x] `PUT /api/v1/users/me/`: Actualizar perfil del usuario
- [x] `GET /api/v1/users/{user_id}/`: Ver perfil público de usuario

✅ **Endpoints de Perfiles**

- [x] `GET /api/v1/profiles/me`: Obtener perfil completo del usuario
- [x] `PUT /api/v1/profiles/me`: Actualizar perfil del usuario
- [x] `GET /api/v1/profiles/{profile_id}`: Ver perfil público

✅ **Endpoints de Trabajos (Jobs)**

- [x] `POST /api/v1/jobs/`: Crear nueva oferta de trabajo
- [x] `GET /api/v1/jobs/`: Listar trabajos con filtros
- [x] `GET /api/v1/jobs/{job_id}/`: Ver detalle de trabajo
- [x] `PUT /api/v1/jobs/{job_id}/`: Actualizar trabajo (solo oferente)
- [x] `DELETE /api/v1/jobs/{job_id}/`: Eliminar trabajo (solo oferente o admin)
- [x] `POST /api/v1/jobs/{job_id}/assign/`: Asignar mercenario a trabajo

### **Próximas Tareas**

🔲 **Sistema de Aplicaciones**

- [ ] Crear modelo `Application` con estados (PENDING, ACCEPTED, REJECTED, COMPLETED)
- [ ] `POST /api/v1/jobs/{job_id}/apply/`: Aplicar a un trabajo
- [ ] `GET /api/v1/applications/`: Ver mis aplicaciones (tanto como oferente como mercenario)
- [ ] `PUT /api/v1/applications/{application_id}/status/`: Cambiar estado de aplicación
- [ ] `GET /api/v1/jobs/{job_id}/applications/`: Ver aplicaciones a un trabajo (solo oferente)

🔲 **Sistema de Reseñas**

- [ ] Crear modelo `Review` con calificación y comentario
- [ ] `POST /api/v1/reviews/`: Crear reseña después de trabajo completado
- [ ] `GET /api/v1/users/{user_id}/reviews/`: Ver reseñas de un usuario
- [ ] Cálculo automático de calificación promedio por usuario
- [ ] Validación para asegurar que solo se pueda dejar reseña por trabajos completados

🔲 **Sistema de Pagos y Contratos**

- [ ] Integración con pasarela de pagos (ej: Stripe, Transbank)
- [ ] Creación de contratos digitales
- [ ] Sistema de depósito en garantía (escrow)
- [ ] Proceso de liberación de fondos al completar el trabajo
- [ ] Historial de transacciones

🔲 **Notificaciones en Tiempo Real**

- [ ] Integración con WebSockets o similar
- [ ] Notificaciones para:
  - Nuevas ofertas de trabajo
  - Aplicaciones a trabajos publicados
  - Cambios de estado en aplicaciones
  - Mensajes entre usuarios
  - Actualizaciones de pagos

🔲 **Seguridad y Mejoras**

- [ ] Rate limiting con slowapi
- [ ] Manejo de errores personalizado
- [ ] Logging con loguru
- [ ] Documentación automática con Swagger/ReDoc
- [ ] Tests unitarios y de integración
- [ ] Monitoreo de rendimiento
- [ ] Auditoría de seguridad

---

## **4. Desarrollo de la Base de Datos (Sprint 1)** 🚧

### **Modelado de Datos con SQLAlchemy**

Vamos a definir los modelos principales de la aplicación. Primero, crearemos los modelos en `models.py`:

1. **Modelo `User`**:
   - `id` (Integer, Primary Key)
   - `email` (String, único, no nulo)
   - `hashed_password` (String, no nulo)
   - `is_active` (Boolean, default=True)
   - `created_at` (DateTime, default=now)
   - `updated_at` (DateTime, default=now, onupdate=now)
   - `role` (Enum: "mercenary", "offerer")

2. **Modelo `Profile`**:
   - `id` (Integer, Primary Key)
   - `user_id` (Integer, ForeignKey a users.id, único)
   - `full_name` (String)
   - `phone` (String, opcional)
   - `bio` (Text, opcional)
   - `skills` (JSON o relación many-to-many con una tabla de habilidades)
   - `experience_years` (Integer, para mercenarios)
   - `company_name` (String, para oferentes, opcional)
   - `website` (String, opcional)

3. **Modelo `Job`**:
   - `id` (Integer, Primary Key)
   - `title` (String, no nulo)
   - `description` (Text, no nulo)
   - `location` (String)
   - `salary_range` (String, ej: "$1000 - $2000")
   - `status` (Enum: "open", "in_progress", "completed", "cancelled")
   - `created_at` (DateTime, default=now)
   - `updated_at` (DateTime, default=now, onupdate=now)
   - `offerer_id` (Integer, ForeignKey a users.id)
   - `assigned_mercenary_id` (Integer, ForeignKey a users.id, opcional)

4. **Modelo `Review`**:
   - `id` (Integer, Primary Key)
   - `rating` (Integer, 1-5)
   - `comment` (Text, opcional)
   - `created_at` (DateTime, default=now)
   - `job_id` (Integer, ForeignKey a jobs.id)
   - `reviewer_id` (Integer, ForeignKey a users.id)
   - `reviewee_id` (Integer, ForeignKey a users.id)

### **Relaciones**

- Un `User` tiene un `Profile` (one-to-one)
- Un `User` (offerer) puede tener muchos `Job`s (one-to-many)
- Un `Job` puede tener una `Review` (one-to-one)
- Un `User` puede tener muchas `Review`s (as reviewee) (one-to-many)

### **Próximos Pasos**

1. Crear el archivo `models.py` con las definiciones anteriores.
2. Configurar las relaciones entre modelos.
3. Crear las tablas en la base de datos.
4. Implementar las migraciones con Alembic.

¿Te gustaría que empecemos implementando estos modelos en código?
