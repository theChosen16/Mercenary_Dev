# **Documentación de API Endpoints - Backend Mercenary**

## **📋 Información General**

- **Base URL**: `http://localhost:8000/api/v1`
- **Formato de Respuesta**: JSON
- **Autenticación**: JWT Bearer Token
- **Versionado**: API v1
- **Documentación Interactiva**: `/docs` (Swagger UI)

---

## **🔐 Autenticación (`/auth`)**

### **POST `/auth/register`**
Registra un nuevo usuario en el sistema.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura",
  "user_type": "MERCENARIO",
  "first_name": "Juan",
  "last_name": "Pérez"
}
```

**Response (201):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "role": "freelancer",
  "is_active": true,
  "created_at": "2025-07-26T20:00:00Z"
}
```

**Errores Posibles:**
- `400`: Email ya registrado
- `422`: Datos de entrada inválidos

---

### **POST `/auth/login`**
Inicia sesión y obtiene tokens JWT.

**Request Body (Form Data):**
```
username: usuario@ejemplo.com
password: contraseña_segura
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 691200
}
```

**Errores Posibles:**
- `401`: Credenciales incorrectas
- `400`: Usuario inactivo

---

### **GET `/auth/test-token`**
Verifica la validez del token actual.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "role": "freelancer",
  "is_active": true
}
```

**Errores Posibles:**
- `401`: Token inválido o expirado

---

### **POST `/auth/refresh`**
Renueva el token de acceso usando el refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "expires_in": 691200
}
```

---

## **👤 Usuarios (`/users`)**

### **GET `/users/profile`**
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "role": "freelancer",
  "is_active": true,
  "profile": {
    "first_name": "Juan",
    "last_name": "Pérez",
    "bio": "Desarrollador Full Stack con 5 años de experiencia",
    "avatar_url": "https://ejemplo.com/avatar.jpg",
    "location": "Santiago, Chile",
    "hourly_rate": 25000.00,
    "availability": "full_time"
  },
  "created_at": "2025-07-26T20:00:00Z"
}
```

---

### **PUT `/users/profile`**
Actualiza el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "first_name": "Juan Carlos",
  "last_name": "Pérez González",
  "bio": "Desarrollador Full Stack especializado en Python y React",
  "location": "Valparaíso, Chile",
  "hourly_rate": 30000.00,
  "website": "https://juanperez.dev",
  "linkedin_url": "https://linkedin.com/in/juanperez"
}
```

**Response (200):**
```json
{
  "message": "Perfil actualizado exitosamente",
  "profile": {
    "first_name": "Juan Carlos",
    "last_name": "Pérez González",
    "bio": "Desarrollador Full Stack especializado en Python y React",
    "location": "Valparaíso, Chile",
    "hourly_rate": 30000.00,
    "updated_at": "2025-07-26T21:00:00Z"
  }
}
```

---

### **GET `/users/{user_id}/public`**
Obtiene el perfil público de un usuario específico.

**Parameters:**
- `user_id` (path): ID del usuario

**Response (200):**
```json
{
  "id": 2,
  "first_name": "María",
  "last_name": "González",
  "bio": "Diseñadora UX/UI con pasión por crear experiencias digitales",
  "avatar_url": "https://ejemplo.com/maria-avatar.jpg",
  "location": "Concepción, Chile",
  "portfolio_url": "https://mariagonzalez.design",
  "skills": ["UI/UX Design", "Figma", "Adobe Creative Suite"],
  "rating_average": 4.8,
  "completed_projects": 23,
  "member_since": "2024-03-15T10:00:00Z"
}
```

---

## **📢 Anuncios (`/announcements`)**

### **GET `/announcements/`**
Lista todos los anuncios con filtros opcionales.

**Query Parameters:**
- `skip` (int): Número de registros a omitir (paginación)
- `limit` (int): Número máximo de registros a retornar
- `category_id` (int): Filtrar por categoría
- `status` (string): Filtrar por estado
- `search` (string): Búsqueda por título o descripción

**Example Request:**
```
GET /api/v1/announcements/?skip=0&limit=10&category_id=1&status=open
```

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "title": "Desarrollo de aplicación móvil para delivery",
      "description": "Necesito desarrollar una app móvil para servicio de delivery...",
      "budget": "$500.000 - $800.000 CLP",
      "status": "open",
      "deadline": "2025-08-15T23:59:59Z",
      "offerer": {
        "id": 3,
        "first_name": "Carlos",
        "last_name": "Empresario",
        "avatar_url": "https://ejemplo.com/carlos-avatar.jpg"
      },
      "category": {
        "id": 1,
        "name": "Desarrollo Móvil"
      },
      "created_at": "2025-07-20T14:30:00Z"
    }
  ],
  "total": 25,
  "skip": 0,
  "limit": 10
}
```

---

### **POST `/announcements/`**
Crea un nuevo anuncio (solo oferentes).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Diseño de logo y branding para startup",
  "description": "Busco un diseñador creativo para desarrollar la identidad visual completa de mi startup tecnológica. Incluye logo, paleta de colores, tipografías y guía de marca.",
  "budget": "$200.000 - $350.000 CLP",
  "deadline": "2025-08-30T23:59:59Z",
  "category_id": 2,
  "required_skills": ["Diseño Gráfico", "Branding", "Adobe Illustrator"]
}
```

**Response (201):**
```json
{
  "id": 26,
  "title": "Diseño de logo y branding para startup",
  "description": "Busco un diseñador creativo para desarrollar...",
  "budget": "$200.000 - $350.000 CLP",
  "status": "open",
  "deadline": "2025-08-30T23:59:59Z",
  "offerer_id": 1,
  "category_id": 2,
  "created_at": "2025-07-26T21:15:00Z"
}
```

**Errores Posibles:**
- `403`: Usuario no autorizado (no es oferente)
- `422`: Datos de entrada inválidos

---

### **GET `/announcements/{announcement_id}`**
Obtiene un anuncio específico con detalles completos.

**Parameters:**
- `announcement_id` (path): ID del anuncio

**Response (200):**
```json
{
  "id": 1,
  "title": "Desarrollo de aplicación móvil para delivery",
  "description": "Necesito desarrollar una app móvil completa para servicio de delivery. La aplicación debe incluir:\n\n- Registro de usuarios\n- Catálogo de productos\n- Carrito de compras\n- Integración con pasarelas de pago\n- Tracking en tiempo real\n- Sistema de calificaciones\n\nTecnologías preferidas: React Native o Flutter",
  "budget": "$500.000 - $800.000 CLP",
  "status": "open",
  "deadline": "2025-08-15T23:59:59Z",
  "offerer": {
    "id": 3,
    "first_name": "Carlos",
    "last_name": "Empresario",
    "avatar_url": "https://ejemplo.com/carlos-avatar.jpg",
    "rating_average": 4.6,
    "completed_projects": 8
  },
  "category": {
    "id": 1,
    "name": "Desarrollo Móvil",
    "description": "Desarrollo de aplicaciones móviles nativas y multiplataforma"
  },
  "required_skills": ["React Native", "Flutter", "API Integration", "Payment Gateways"],
  "applications_count": 12,
  "created_at": "2025-07-20T14:30:00Z",
  "updated_at": "2025-07-20T14:30:00Z"
}
```

---

### **PUT `/announcements/{announcement_id}`**
Actualiza un anuncio existente (solo el propietario).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `announcement_id` (path): ID del anuncio

**Request Body:**
```json
{
  "title": "Desarrollo de aplicación móvil para delivery - URGENTE",
  "description": "Descripción actualizada...",
  "budget": "$600.000 - $900.000 CLP",
  "deadline": "2025-08-10T23:59:59Z"
}
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Desarrollo de aplicación móvil para delivery - URGENTE",
  "description": "Descripción actualizada...",
  "budget": "$600.000 - $900.000 CLP",
  "deadline": "2025-08-10T23:59:59Z",
  "updated_at": "2025-07-26T21:30:00Z"
}
```

**Errores Posibles:**
- `403`: No autorizado (no es el propietario)
- `404`: Anuncio no encontrado

---

### **DELETE `/announcements/{announcement_id}`**
Elimina un anuncio (solo el propietario).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `announcement_id` (path): ID del anuncio

**Response (204):**
```
No Content
```

**Errores Posibles:**
- `403`: No autorizado
- `404`: Anuncio no encontrado
- `400`: No se puede eliminar (tiene contratos activos)

---

## **📋 Contratos (`/contracts`)**

### **GET `/contracts/`**
Lista los contratos del usuario autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `skip` (int): Paginación
- `limit` (int): Límite de resultados
- `status` (string): Filtrar por estado

**Response (200):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Desarrollo de aplicación móvil para delivery",
      "amount": 750000.00,
      "status": "active",
      "announcement": {
        "id": 1,
        "title": "Desarrollo de aplicación móvil para delivery"
      },
      "mercenary": {
        "id": 2,
        "first_name": "Ana",
        "last_name": "Desarrolladora"
      },
      "created_at": "2025-07-25T10:00:00Z",
      "started_at": "2025-07-25T12:00:00Z"
    }
  ],
  "total": 3,
  "skip": 0,
  "limit": 10
}
```

---

### **POST `/contracts/`**
Crea un nuevo contrato (solo oferentes).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "announcement_id": 1,
  "mercenary_id": 2,
  "title": "Desarrollo de aplicación móvil para delivery",
  "description": "Contrato para el desarrollo completo de la aplicación según especificaciones del anuncio.",
  "amount": 750000.00,
  "terms": "Pago 50% al inicio, 50% al completar. Plazo: 6 semanas."
}
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Desarrollo de aplicación móvil para delivery",
  "description": "Contrato para el desarrollo completo...",
  "amount": 750000.00,
  "status": "draft",
  "announcement_id": 1,
  "mercenary_id": 2,
  "created_at": "2025-07-26T21:45:00Z"
}
```

---

### **GET `/contracts/{contract_id}`**
Obtiene detalles de un contrato específico.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `contract_id` (path): UUID del contrato

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Desarrollo de aplicación móvil para delivery",
  "description": "Contrato para el desarrollo completo de la aplicación...",
  "terms": "Pago 50% al inicio, 50% al completar. Plazo: 6 semanas.",
  "amount": 750000.00,
  "status": "active",
  "announcement": {
    "id": 1,
    "title": "Desarrollo de aplicación móvil para delivery",
    "offerer": {
      "id": 3,
      "first_name": "Carlos",
      "last_name": "Empresario"
    }
  },
  "mercenary": {
    "id": 2,
    "first_name": "Ana",
    "last_name": "Desarrolladora",
    "avatar_url": "https://ejemplo.com/ana-avatar.jpg"
  },
  "transactions": [
    {
      "id": 1,
      "amount": 375000.00,
      "transaction_type": "deposit",
      "status": "completed",
      "processed_at": "2025-07-25T12:00:00Z"
    }
  ],
  "created_at": "2025-07-25T10:00:00Z",
  "started_at": "2025-07-25T12:00:00Z"
}
```

---

### **PUT `/contracts/{contract_id}/status`**
Actualiza el estado de un contrato.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Parameters:**
- `contract_id` (path): UUID del contrato

**Request Body:**
```json
{
  "status": "completed",
  "notes": "Trabajo completado satisfactoriamente según especificaciones."
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "completed_at": "2025-07-26T22:00:00Z",
  "updated_at": "2025-07-26T22:00:00Z"
}
```

---

## **📂 Categorías (`/categories`)**

### **GET `/categories/`**
Lista todas las categorías disponibles.

**Response (200):**
```json
{
  "items": [
    {
      "id": 1,
      "name": "Desarrollo Web",
      "description": "Desarrollo de sitios web y aplicaciones web",
      "parent_id": null,
      "subcategories": [
        {
          "id": 11,
          "name": "Frontend",
          "description": "Desarrollo de interfaces de usuario"
        },
        {
          "id": 12,
          "name": "Backend",
          "description": "Desarrollo de APIs y lógica de servidor"
        }
      ],
      "is_active": true
    },
    {
      "id": 2,
      "name": "Diseño Gráfico",
      "description": "Servicios de diseño visual y branding",
      "parent_id": null,
      "subcategories": [],
      "is_active": true
    }
  ]
}
```

---

### **POST `/categories/`**
Crea una nueva categoría (solo administradores).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "Inteligencia Artificial",
  "description": "Servicios relacionados con IA y Machine Learning",
  "parent_id": null
}
```

**Response (201):**
```json
{
  "id": 15,
  "name": "Inteligencia Artificial",
  "description": "Servicios relacionados con IA y Machine Learning",
  "parent_id": null,
  "is_active": true,
  "created_at": "2025-07-26T22:15:00Z"
}
```

**Errores Posibles:**
- `403`: No autorizado (no es administrador)
- `400`: Nombre de categoría ya existe

---

### **GET `/categories/{category_id}`**
Obtiene una categoría específica con sus subcategorías.

**Parameters:**
- `category_id` (path): ID de la categoría

**Response (200):**
```json
{
  "id": 1,
  "name": "Desarrollo Web",
  "description": "Desarrollo de sitios web y aplicaciones web",
  "parent_id": null,
  "subcategories": [
    {
      "id": 11,
      "name": "Frontend",
      "description": "Desarrollo de interfaces de usuario",
      "announcements_count": 45
    },
    {
      "id": 12,
      "name": "Backend",
      "description": "Desarrollo de APIs y lógica de servidor",
      "announcements_count": 32
    }
  ],
  "announcements_count": 77,
  "is_active": true,
  "created_at": "2025-01-15T10:00:00Z"
}
```

---

## **🏥 Health Check (`/health`)**

### **GET `/health/`**
Verifica el estado de salud del sistema.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-26T22:30:00Z",
  "version": "0.1.0",
  "database": {
    "status": "connected",
    "response_time_ms": 12
  },
  "dependencies": {
    "postgresql": "healthy",
    "redis": "not_configured"
  }
}
```

---

## **📊 Códigos de Estado HTTP**

### **Códigos de Éxito**
- `200 OK`: Solicitud exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Solicitud exitosa sin contenido de respuesta

### **Códigos de Error del Cliente**
- `400 Bad Request`: Solicitud malformada o datos inválidos
- `401 Unauthorized`: Autenticación requerida o token inválido
- `403 Forbidden`: Acceso denegado (permisos insuficientes)
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Errores de validación de datos

### **Códigos de Error del Servidor**
- `500 Internal Server Error`: Error interno del servidor
- `503 Service Unavailable`: Servicio temporalmente no disponible

---

## **🔒 Autenticación y Autorización**

### **Flujo de Autenticación**
1. **Registro**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Obtener tokens
3. **Uso**: Incluir `Authorization: Bearer <token>` en headers
4. **Renovación**: `POST /auth/refresh` cuando el token expire

### **Roles y Permisos**
- **CLIENT**: Puede crear anuncios, contratos, y calificar mercenarios
- **FREELANCER**: Puede aplicar a anuncios, aceptar contratos, y calificar clientes
- **ADMIN**: Acceso completo al sistema, gestión de categorías y usuarios

---

## **📄 Paginación**

### **Parámetros Estándar**
- `skip`: Número de registros a omitir (default: 0)
- `limit`: Número máximo de registros (default: 10, max: 100)

### **Formato de Respuesta**
```json
{
  "items": [...],
  "total": 150,
  "skip": 20,
  "limit": 10,
  "has_next": true,
  "has_previous": true
}
```

---

## **🔍 Filtros y Búsqueda**

### **Filtros Comunes**
- **Anuncios**: `category_id`, `status`, `search`, `budget_min`, `budget_max`
- **Contratos**: `status`, `date_from`, `date_to`
- **Usuarios**: `role`, `is_active`, `location`

### **Búsqueda de Texto**
- Parámetro: `search`
- Campos buscados: título, descripción, tags
- Tipo: Búsqueda parcial (LIKE %term%)

---

*Documentación generada el 26 de Julio, 2025*
*Versión del Backend: 0.1.0*
