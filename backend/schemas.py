from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    is_offerer: bool  # True si es Oferente, False si es Mercenario


class User(BaseModel):
    id: int
    email: EmailStr
    is_offerer: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: str | None = None
