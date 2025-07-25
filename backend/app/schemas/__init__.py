"""
Módulo que contiene los esquemas Pydantic para validación de datos.
"""
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDBBase,
    User,
    UserPublic,
)

from .token import (
    Token,
    TokenPayload,
    TokenData,
    LoginRequest,
    RefreshTokenRequest,
)

from .announcement import (
    Announcement,
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementInDB,
)

from .category import (
    Category,
    CategoryCreate,
    CategoryUpdate,
)

from .contract import (
    Contract,
    ContractCreate,
    ContractUpdate,
    Transaction,
    TransactionCreate,
)


__all__ = [
    # User schemas
    'UserBase',
    'UserCreate',
    'UserUpdate',
    'UserInDBBase',
    'User',
    'UserPublic',
    
    # Token schemas
    'Token',
    'TokenPayload',
    'TokenData',
    'LoginRequest',
    'RefreshTokenRequest',

    # Announcement schemas
    'Announcement',
    'AnnouncementCreate',
    'AnnouncementUpdate',
    'AnnouncementInDB',

    # Category schemas
    'Category',
    'CategoryCreate',
    'CategoryUpdate',

    # Contract schemas
    'Contract',
    'ContractCreate',
    'ContractUpdate',
    'Transaction',
    'TransactionCreate',
]
