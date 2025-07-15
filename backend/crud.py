from sqlalchemy.orm import Session

import auth
import models
import schemas


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        is_offerer=user.is_offerer
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
