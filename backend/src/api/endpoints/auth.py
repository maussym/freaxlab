from uuid import uuid4

import aiosqlite
from fastapi import APIRouter, Depends, HTTPException, status

from src.database import get_db
from src.api.deps import get_current_user
from src.schemas.auth import LoginRequest, LoginResponse, RegisterRequest, UserProfile
from src.services.auth_service import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute("SELECT id FROM users WHERE email = ?", (body.email,))
    if await cursor.fetchone():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user_id = uuid4().hex
    pw_hash = hash_password(body.password)
    await db.execute(
        "INSERT INTO users (id, email, password_hash, full_name) VALUES (?, ?, ?, ?)",
        (user_id, body.email, pw_hash, body.full_name),
    )
    await db.commit()

    token = create_access_token(user_id)
    return LoginResponse(access_token=token)


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id, password_hash FROM users WHERE email = ?", (body.email,)
    )
    row = await cursor.fetchone()
    if not row or not verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(row["id"])
    return LoginResponse(access_token=token)


@router.get("/me", response_model=UserProfile)
async def me(user_id: str = Depends(get_current_user), db: aiosqlite.Connection = Depends(get_db)):
    cursor = await db.execute(
        "SELECT id, email, full_name, created_at FROM users WHERE id = ?", (user_id,)
    )
    row = await cursor.fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return UserProfile(
        id=row["id"], email=row["email"], full_name=row["full_name"], created_at=row["created_at"]
    )
