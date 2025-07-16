from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr

from .models import UserType


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None



class UserCreate(UserBase):
    password: str



class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    password: Optional[str] = None



class UserInDBBase(UserBase):
    id: int
    user_type: UserType
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True



class User(UserInDBBase):
    pass



class UserPublic(UserInDBBase):
    pass



class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str



class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    user_type: Optional[UserType] = None
