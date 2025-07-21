from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Table, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from database import Base

# Tabla de asociación para la relación muchos a muchos entre Usuarios y Habilidades
user_skills = Table(
    "user_skills",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id"), primary_key=True)
)

# Tabla de asociación para la relación muchos a muchos entre Proyectos y Categorías
project_categories = Table(
    "project_categories",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("category_id", Integer, ForeignKey("categories.id"), primary_key=True)
)

class UserType(str, enum.Enum):
    CLIENT = "client"
    FREELANCER = "freelancer"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    bio = Column(Text)
    profile_picture = Column(String)
    user_type = Column(Enum(UserType), default=UserType.FREELANCER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    skills = relationship("Skill", secondary=user_skills, back_populates="users")
    projects = relationship("Project", back_populates="client")
    offers = relationship("Offer", back_populates="freelancer")
    ratings_given = relationship("Rating", foreign_keys="[Rating.rater_id]", back_populates="rater")
    ratings_received = relationship("Rating", foreign_keys="[Rating.ratee_id]", back_populates="ratee")

class ProjectStatus(str, enum.Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    budget = Column(Float)
    deadline = Column(DateTime(timezone=True))
    status = Column(Enum(ProjectStatus), default=ProjectStatus.DRAFT)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    client = relationship("User", back_populates="projects")
    offers = relationship("Offer", back_populates="project", cascade="all, delete-orphan")
    categories = relationship("Category", secondary=project_categories, back_populates="projects")
    skills_required = relationship("Skill", secondary="project_skills")

class OfferStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class Offer(Base):
    __tablename__ = "offers"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(Text)
    status = Column(Enum(OfferStatus), default=OfferStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    project = relationship("Project", back_populates="offers")
    freelancer = relationship("User", back_populates="offers")
    rating = relationship("Rating", back_populates="offer", uselist=False)

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    rater_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Quién califica
    ratee_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Quién es calificado
    score = Column(Integer, nullable=False)  # 1-5
    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    offer = relationship("Offer", back_populates="rating")
    rater = relationship("User", foreign_keys=[rater_id], back_populates="ratings_given")
    ratee = relationship("User", foreign_keys=[ratee_id], back_populates="ratings_received")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    
    # Relaciones
    users = relationship("User", secondary=user_skills, back_populates="skills")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text)
    
    # Relaciones
    projects = relationship("Project", secondary=project_categories, back_populates="categories")
