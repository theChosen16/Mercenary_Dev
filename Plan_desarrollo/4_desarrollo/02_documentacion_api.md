# Documentación de la API

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Incluye el token en el header `Authorization` de las peticiones:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticación

#### `POST /api/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "user_type": "mercenary"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "usuario@ejemplo.com",
  "user_type": "mercenary",
  "created_at": "2025-07-15T20:30:00Z"
}
```

### Usuarios

#### `GET /api/users/me`
Obtiene la información del usuario autenticado.

**Respuesta exitosa (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "user_type": "mercenary",
  "rating": 4.8,
  "created_at": "2025-07-15T20:30:00Z"
}
```

### Trabajos (Jobs)

#### `GET /api/jobs`
Lista los trabajos disponibles con opciones de filtrado.

**Parámetros de consulta:**
- `status` (opcional): Estado del trabajo (open, in_progress, completed, cancelled)
- `category` (opcional): Categoría del trabajo
- `min_price` (opcional): Precio mínimo
- `max_price` (opcional): Precio máximo

**Respuesta exitosa (200):**
```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Desarrollo de app móvil",
      "description": "Se necesita desarrollar una aplicación móvil con Flutter",
      "status": "open",
      "price": 1500.00,
      "category": "mobile_development",
      "created_at": "2025-07-15T10:30:00Z",
      "client_id": "123e4567-e89b-12d3-a456-426614174000"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

## Códigos de Estado HTTP

- `200 OK`: La petición se completó exitosamente.
- `201 Created`: Recurso creado exitosamente.
- `400 Bad Request`: Error en los datos enviados.
- `401 Unauthorized`: No se proporcionó token o es inválido.
- `403 Forbidden`: El usuario no tiene permisos para realizar la acción.
- `404 Not Found`: El recurso solicitado no existe.
- `500 Internal Server Error`: Error interno del servidor.

## Ejemplo de Uso con cURL

```bash
# Obtener perfil del usuario
curl -X GET "https://api.mercenary.dev/api/users/me" \
  -H "Authorization: Bearer <token>"

# Crear un nuevo trabajo
curl -X POST "https://api.mercenary.dev/api/jobs" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Diseño de logo", "description": "Necesito un logo para mi empresa", "price": 300}'
```

## Próximos Pasos
- [ ] Documentar endpoints adicionales
- [ ] Agregar ejemplos de código en diferentes lenguajes
- [ ] Documentar esquemas de datos completos
- [ ] Agregar sección de webhooks
