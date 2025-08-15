# **Documentación de Modelos de Datos - Backend Mercenary**

## **📋 Información General**

Este documento detalla todos los modelos de datos implementados en el backend, sus relaciones, campos, validaciones y propósito dentro del sistema.

---

## **👤 User (Usuario)**

### **Ubicación**: `app/models/user.py`

### **Propósito**
Modelo central que representa a todos los usuarios del sistema, incluyendo oferentes, mercenarios y administradores.

### **Definición del Modelo**
```python
class User(Base):
    __tablename__ = "users"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    email: Mapped[EmailStr] = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = Column(String(255), nullable=False)
    is_active: Mapped[bool] = Column(Boolean, default=True)
    role: Mapped[UserRole] = Column(SAEnum(UserRole), nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### **Campos**
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | Integer | Identificador único | PK, Auto-increment, Index |
| `email` | String(255) | Email del usuario | Unique, Index, Not Null |
| `hashed_password` | String(255) | Contraseña hasheada con bcrypt | Not Null |
| `is_active` | Boolean | Estado de activación del usuario | Default: True |
| `role` | UserRole | Rol del usuario en el sistema | Not Null |
| `created_at` | DateTime | Fecha de creación | Default: UTC Now |
| `updated_at` | DateTime | Fecha de última actualización | Auto-update |

### **Enumeraciones**
```python
class UserRole(str, Enum):
    CLIENT = "client"        # Oferente que publica trabajos
    FREELANCER = "freelancer" # Mercenario que realiza trabajos
    ADMIN = "admin"          # Administrador del sistema
```

### **Relaciones**
- **Announcements**: Un usuario puede crear múltiples anuncios (1:N)
- **Contracts**: Un usuario puede participar en múltiples contratos (1:N)
- **Reviews**: Un usuario puede escribir múltiples reseñas (1:N)
- **Profile**: Un usuario tiene un perfil (1:1)

### **Métodos Auxiliares**
```python
def get_user_by_email(db: Session, email: EmailStr) -> Optional[User]:
    """Obtiene un usuario por su email."""
    return db.query(User).filter(User.email == email).first()
```

---

## **📢 Announcement (Anuncio)**

### **Ubicación**: `app/models/announcement.py`

### **Propósito**
Representa los trabajos publicados por los oferentes que los mercenarios pueden solicitar.

### **Definición del Modelo**
```python
class Announcement(Base):
    __tablename__ = "announcements"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    title: Mapped[str] = Column(String(200), nullable=False, index=True)
    description: Mapped[str] = Column(Text, nullable=False)
    budget: Mapped[str] = Column(String(100), nullable=False)
    deadline: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
    status: Mapped[AnnouncementStatus] = Column(SQLEnum(AnnouncementStatus), default=AnnouncementStatus.OPEN, nullable=False, index=True)
    offerer_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[int] = Column(Integer, ForeignKey("categories.id"), nullable=False, index=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### **Campos**
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | Integer | Identificador único | PK, Auto-increment, Index |
| `title` | String(200) | Título del trabajo | Not Null, Index |
| `description` | Text | Descripción detallada | Not Null |
| `budget` | String(100) | Presupuesto o rango salarial | Not Null |
| `deadline` | DateTime | Fecha límite para postular | Nullable |
| `status` | AnnouncementStatus | Estado actual del anuncio | Default: OPEN, Index |
| `offerer_id` | Integer | ID del oferente | FK users.id, Index |
| `category_id` | Integer | ID de la categoría | FK categories.id, Index |
| `created_at` | DateTime | Fecha de creación | Default: UTC Now, Index |
| `updated_at` | DateTime | Fecha de actualización | Auto-update |

### **Estados del Anuncio**
```python
class AnnouncementStatus(str, Enum):
    OPEN = "open"           # Abierto para aplicaciones
    CLOSED = "closed"       # Cerrado (seleccionado mercenario o cancelado)
    IN_PROGRESS = "in_progress"  # Trabajo en progreso
    COMPLETED = "completed"      # Trabajo completado
```

### **Relaciones**
- **Offerer**: Pertenece a un User (oferente) - N:1
- **Category**: Pertenece a una Category - N:1
- **Contracts**: Puede generar múltiples contratos - 1:N
- **Reviews**: Puede recibir múltiples reseñas - 1:N

---

## **📋 Contract (Contrato)**

### **Ubicación**: `app/models/contract.py`

### **Propósito**
Formaliza el acuerdo entre oferente y mercenario, incluyendo términos, pagos y sistema de escrow.

### **Definición del Modelo**
```python
class Contract(Base):
    __tablename__ = "contracts"
    
    id: Mapped[UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title: Mapped[str] = Column(String(200), nullable=False)
    description: Mapped[str] = Column(Text, nullable=False)
    terms: Mapped[Optional[str]] = Column(Text, nullable=True)
    amount: Mapped[Decimal] = Column(Numeric(10, 2), nullable=False)
    status: Mapped[ContractStatus] = Column(SQLEnum(ContractStatus), default=ContractStatus.DRAFT, nullable=False, index=True)
    announcement_id: Mapped[int] = Column(Integer, ForeignKey("announcements.id", ondelete="CASCADE"), nullable=False, index=True)
    mercenary_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    started_at: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
    completed_at: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
```

### **Campos**
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | UUID | Identificador único | PK, UUID4, Index |
| `title` | String(200) | Título del contrato | Not Null |
| `description` | Text | Descripción del trabajo | Not Null |
| `terms` | Text | Términos y condiciones | Nullable |
| `amount` | Decimal(10,2) | Monto total del contrato | Not Null |
| `status` | ContractStatus | Estado actual | Default: DRAFT, Index |
| `announcement_id` | Integer | ID del anuncio origen | FK announcements.id, Index |
| `mercenary_id` | Integer | ID del mercenario | FK users.id, Index |
| `created_at` | DateTime | Fecha de creación | Default: UTC Now |
| `updated_at` | DateTime | Fecha de actualización | Auto-update |
| `started_at` | DateTime | Fecha de inicio del trabajo | Nullable |
| `completed_at` | DateTime | Fecha de finalización | Nullable |

### **Estados del Contrato**
```python
class ContractStatus(str, Enum):
    DRAFT = "draft"         # Borrador, aún no aceptado
    PENDING = "pending"     # Aceptado, esperando pago
    ACTIVE = "active"       # Pago recibido, trabajo en progreso
    COMPLETED = "completed" # Trabajo completado y pagado
    DISPUTED = "disputed"   # En disputa
    CANCELLED = "cancelled" # Cancelado
    REFUNDED = "refunded"   # Reembolsado al oferente
```

### **Relaciones**
- **Announcement**: Pertenece a un Announcement - N:1
- **Mercenary**: Pertenece a un User (mercenario) - N:1
- **Transactions**: Tiene múltiples transacciones - 1:N
- **Reviews**: Puede recibir múltiples reseñas - 1:N

---

## **💰 Transaction (Transacción)**

### **Ubicación**: `app/models/contract.py` (mismo archivo que Contract)

### **Propósito**
Registra todos los movimientos financieros relacionados con contratos, incluyendo depósitos, liberaciones y reembolsos.

### **Definición del Modelo**
```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    amount: Mapped[Decimal] = Column(Numeric(10, 2), nullable=False)
    transaction_type: Mapped[str] = Column(SQLEnum(TransactionType), nullable=False, index=True)
    status: Mapped[str] = Column(String(20), default="pending", nullable=False, index=True)
    contract_id: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    processed_at: Mapped[Optional[datetime]] = Column(DateTime, nullable=True)
    notes: Mapped[Optional[str]] = Column(Text, nullable=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### **Tipos de Transacción**
```python
class TransactionType(str, Enum):
    DEPOSIT = "deposit"     # Depósito inicial del oferente
    RELEASE = "release"     # Liberación de fondos al mercenario
    REFUND = "refund"       # Reembolso al oferente
    FEE = "fee"            # Comisión de la plataforma
```

### **Estados de Transacción**
- `pending`: Transacción pendiente de procesamiento
- `completed`: Transacción completada exitosamente
- `failed`: Transacción fallida

---

## **⭐ Review (Reseña)**

### **Ubicación**: `app/models/review.py`

### **Propósito**
Sistema de calificaciones y comentarios entre usuarios después de completar un trabajo.

### **Definición del Modelo**
```python
class Review(Base):
    __tablename__ = "reviews"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    rating: Mapped[int] = Column(Integer, nullable=False)
    comment: Mapped[Optional[str]] = Column(Text, nullable=True)
    reviewer_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewee_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    contract_id: Mapped[UUID] = Column(UUID(as_uuid=True), ForeignKey("contracts.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### **Campos**
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `id` | Integer | Identificador único | PK, Auto-increment, Index |
| `rating` | Integer | Calificación (1-5) | Not Null, Range 1-5 |
| `comment` | Text | Comentario opcional | Nullable |
| `reviewer_id` | Integer | ID del usuario que califica | FK users.id, Index |
| `reviewee_id` | Integer | ID del usuario calificado | FK users.id, Index |
| `contract_id` | UUID | ID del contrato relacionado | FK contracts.id, Index |
| `created_at` | DateTime | Fecha de creación | Default: UTC Now |
| `updated_at` | DateTime | Fecha de actualización | Auto-update |

---

## **📂 Category (Categoría)**

### **Ubicación**: `app/models/category.py`

### **Propósito**
Clasificación jerárquica de los tipos de trabajo disponibles en la plataforma.

### **Definición del Modelo**
```python
class Category(Base):
    __tablename__ = "categories"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = Column(Text, nullable=True)
    parent_id: Mapped[Optional[int]] = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

### **Estructura Jerárquica**
Las categorías soportan una estructura de árbol con subcategorías:
- **Categoría Padre**: `parent_id = NULL`
- **Subcategoría**: `parent_id = ID de categoría padre`

---

## **👤 Profile (Perfil)**

### **Ubicación**: `app/models/profile.py`

### **Propósito**
Información extendida del perfil de usuario, incluyendo datos personales y profesionales.

### **Definición del Modelo**
```python
class Profile(Base):
    __tablename__ = "profiles"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    first_name: Mapped[Optional[str]] = Column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = Column(String(100), nullable=True)
    bio: Mapped[Optional[str]] = Column(Text, nullable=True)
    avatar_url: Mapped[Optional[str]] = Column(String(500), nullable=True)
    location: Mapped[Optional[str]] = Column(String(200), nullable=True)
    phone: Mapped[Optional[str]] = Column(String(20), nullable=True)
    website: Mapped[Optional[str]] = Column(String(500), nullable=True)
    linkedin_url: Mapped[Optional[str]] = Column(String(500), nullable=True)
    github_url: Mapped[Optional[str]] = Column(String(500), nullable=True)
    portfolio_url: Mapped[Optional[str]] = Column(String(500), nullable=True)
    hourly_rate: Mapped[Optional[Decimal]] = Column(Numeric(8, 2), nullable=True)
    availability: Mapped[Optional[str]] = Column(String(50), nullable=True)
    created_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
```

---

## **🛠️ Skill (Habilidad)**

### **Ubicación**: `app/models/skill.py`

### **Propósito**
Catálogo de habilidades técnicas que pueden asociarse a usuarios y proyectos.

### **Definición del Modelo**
```python
class Skill(Base):
    __tablename__ = "skills"
    
    id: Mapped[int] = Column(Integer, primary_key=True, index=True)
    name: Mapped[str] = Column(String(100), nullable=False, unique=True, index=True)
    description: Mapped[Optional[str]] = Column(Text, nullable=True)
    category: Mapped[Optional[str]] = Column(String(50), nullable=True, index=True)
    is_active: Mapped[bool] = Column(Boolean, default=True, nullable=False)
```

---

## **🔗 Relaciones y Constraints**

### **Integridad Referencial**
- **CASCADE DELETE**: Cuando se elimina un usuario, se eliminan sus contratos, reseñas y perfil
- **RESTRICT**: Las categorías no pueden eliminarse si tienen anuncios asociados
- **UNIQUE CONSTRAINTS**: Email de usuario, nombre de categoría, nombre de habilidad

### **Índices de Rendimiento**
- **Usuarios**: email, role, created_at
- **Anuncios**: title, status, offerer_id, category_id, created_at
- **Contratos**: status, announcement_id, mercenary_id
- **Transacciones**: transaction_type, status, contract_id
- **Reseñas**: reviewer_id, reviewee_id, contract_id

---

## **📊 Consideraciones de Rendimiento**

### **Consultas Optimizadas**
- Uso de índices en campos de búsqueda frecuente
- Lazy loading para relaciones no críticas
- Paginación en listados grandes

### **Validaciones a Nivel de Base de Datos**
- Constraints de integridad referencial
- Validaciones de rango para ratings (1-5)
- Validaciones de formato para emails y URLs

---

## **🔮 Evolución Futura**

### **Modelos Planificados**
- **Application**: Postulaciones a anuncios
- **Message**: Sistema de mensajería
- **Notification**: Notificaciones del sistema
- **Payment**: Integración con pasarelas de pago
- **Dispute**: Sistema de resolución de disputas

### **Mejoras Previstas**
- Soft delete para registros críticos
- Auditoría de cambios (audit trail)
- Versionado de contratos
- Métricas de rendimiento por usuario

---

*Documentación generada el 26 de Julio, 2025*
*Versión del Backend: 0.1.0*
