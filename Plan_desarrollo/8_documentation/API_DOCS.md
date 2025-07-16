# Mercenary API Documentation

This document provides comprehensive documentation for the Mercenary API, including available endpoints, request/response formats, and examples.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Projects](#projects)
  - [Proposals](#proposals)
  - [Skills](#skills)
  - [Health](#health)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Filtering and Sorting](#filtering-and-sorting)
- [Examples](#examples)

## Authentication

All API endpoints (except `/auth/*` and `/health/*`) require authentication. Include the JWT token in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## Base URL

```
https://api.mercenary.example.com/api/v1
```

For local development:

```
http://localhost:8000/api/v1
```

## Endpoints

### Auth

#### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_superuser": false,
    "role": "freelancer"
  }
}
```

#### Register

```http
POST /auth/register
```

**Request Body:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "full_name": "Jane Smith",
  "role": "client"
}
```

**Response:**

```json
{
  "id": 2,
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "is_active": true,
  "is_superuser": false,
  "role": "client"
}
```

### Users

#### Get Current User

```http
GET /users/me
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "role": "freelancer",
  "skills": [
    {
      "id": 1,
      "name": "Python",
      "proficiency": 4
    },
    {
      "id": 2,
      "name": "FastAPI",
      "proficiency": 3
    }
  ]
}
```

#### Update User

```http
PUT /users/me
```

**Request Body:**

```json
{
  "full_name": "John Updated",
  "bio": "Experienced Python developer"
}
```

**Response:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Updated",
  "bio": "Experienced Python developer",
  "is_active": true,
  "is_superuser": false,
  "role": "freelancer"
}
```

### Projects

#### List Projects

```http
GET /projects
```

**Query Parameters:**

- `status` (optional): Filter by status (draft, open, in_progress, completed, cancelled)
- `skills` (optional): Comma-separated list of skill IDs to filter by
- `min_budget` (optional): Minimum budget
- `max_budget` (optional): Maximum budget
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "title": "Build a REST API with FastAPI",
      "description": "Need a REST API built with FastAPI and PostgreSQL",
      "budget": 1000,
      "status": "open",
      "client_id": 1,
      "created_at": "2023-07-15T10:00:00Z",
      "updated_at": "2023-07-15T10:00:00Z",
      "skills": [
        {
          "id": 1,
          "name": "Python"
        },
        {
          "id": 2,
          "name": "FastAPI"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "pages": 1
}
```

#### Create Project

```http
POST /projects
```

**Request Body:**

```json
{
  "title": "New Project",
  "description": "Project description",
  "budget": 500,
  "status": "draft",
  "skill_ids": [1, 2, 3]
}
```

**Response:**

```json
{
  "id": 2,
  "title": "New Project",
  "description": "Project description",
  "budget": 500,
  "status": "draft",
  "client_id": 1,
  "created_at": "2023-07-15T11:00:00Z",
  "updated_at": "2023-07-15T11:00:00Z",
  "skills": [
    {
      "id": 1,
      "name": "Python"
    },
    {
      "id": 2,
      "name": "FastAPI"
    },
    {
      "id": 3,
      "name": "PostgreSQL"
    }
  ]
}
```

### Proposals

#### Submit Proposal

```http
POST /proposals
```

**Request Body:**

```json
{
  "project_id": 1,
  "cover_letter": "I'm interested in working on this project.",
  "bid_amount": 800,
  "estimated_days": 14
}
```

**Response:**

```json
{
  "id": 1,
  "project_id": 1,
  "freelancer_id": 2,
  "cover_letter": "I'm interested in working on this project.",
  "bid_amount": 800,
  "estimated_days": 14,
  "status": "pending",
  "created_at": "2023-07-15T12:00:00Z",
  "updated_at": "2023-07-15T12:00:00Z"
}
```

### Skills

#### List Skills

```http
GET /skills
```

**Query Parameters:**

- `q` (optional): Search query
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Response:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Python",
      "description": "Python programming language"
    },
    {
      "id": 2,
      "name": "FastAPI",
      "description": "Modern, fast web framework for building APIs"
    }
  ],
  "total": 2,
  "page": 1,
  "pages": 1
}
```

### Health

#### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2023-07-15T12:00:00Z",
  "services": {
    "database": "connected",
    "cache": "connected"
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "detail": [
    {
      "loc": ["string", 0],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### Common Error Status Codes

- `400 Bad Request`: The request was invalid or cannot be served
- `401 Unauthorized`: Authentication is required and has failed or has not been provided
- `403 Forbidden`: The request was valid, but the server is refusing action
- `404 Not Found`: The requested resource could not be found
- `422 Unprocessable Entity`: The request was well-formed but was unable to be followed due to semantic errors
- `500 Internal Server Error`: An error occurred on the server

## Rate Limiting

API requests are rate limited to prevent abuse. The current limits are:

- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

### Rate Limit Headers

- `X-RateLimit-Limit`: The maximum number of requests allowed in the current period
- `X-RateLimit-Remaining`: The number of requests remaining in the current period
- `X-RateLimit-Reset`: The time at which the current rate limit window resets in UTC epoch seconds

## Pagination

Endpoints that return lists of items support pagination using the `page` and `limit` query parameters.

### Pagination Response Format

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pages": 1
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting using query parameters.

### Filtering

Use query parameters to filter results. For example:

```
GET /projects?status=open&min_budget=500
```

### Sorting

Use the `sort` parameter to sort results. Prefix with `-` for descending order.

```
GET /projects?sort=-created_at  # Newest first
```

## Examples

### Get all open projects with Python skill

```http
GET /projects?status=open&skills=1
```

### Get user's proposals

```http
GET /proposals/me
```

### Update project status

```http
PATCH /projects/1/status
```

**Request Body:**

```json
{
  "status": "in_progress"
}
```

## Webhooks

Webhooks allow you to receive real-time notifications about events in the system.

### Available Events

- `project.created`
- `project.updated`
- `project.deleted`
- `proposal.submitted`
- `proposal.accepted`
- `proposal.rejected`

### Webhook Payload Example

```json
{
  "event": "project.created",
  "data": {
    "id": 1,
    "title": "New Project",
    "status": "open"
  },
  "created_at": "2023-07-15T12:00:00Z"
}
```

## Support

For support, please contact support@mercenary.example.com or open an issue in our GitHub repository.
