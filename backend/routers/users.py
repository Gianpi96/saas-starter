from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

from database import get_db
from models import User
from dependencies import get_current_user
from security import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str | None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La password deve essere di almeno 8 caratteri")
        return v


class MessageResponse(BaseModel):
    message: str


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    # Controlla che la nuova email non sia già usata da un altro utente
    if body.email is not None and body.email != current_user.email:
        result = await db.execute(select(User).where(User.email == body.email))
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email già in uso da un altro account",
            )
        current_user.email = body.email

    if body.full_name is not None:
        current_user.full_name = body.full_name

    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/me/change-password", response_model=MessageResponse)
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password attuale non corretta",
        )

    if body.current_password == body.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nuova password deve essere diversa da quella attuale",
        )

    current_user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return MessageResponse(message="Password aggiornata con successo")
