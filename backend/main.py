from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import get_settings
from database import create_tables
from redis_client import get_redis, close_redis
from routers import auth, users

settings = get_settings()
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    await get_redis()
    yield
    # Shutdown
    await close_redis()


app = FastAPI(
    title="SaaS Starter API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs" if settings.environment != "production" else None,
    redoc_url="/api/redoc" if settings.environment != "production" else None,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/ready")
async def readiness_check(request: Request):
    redis = await get_redis()
    try:
        await redis.ping()
        redis_ok = True
    except Exception:
        redis_ok = False

    return {
        "status": "ok" if redis_ok else "degraded",
        "redis": "ok" if redis_ok else "error",
    }
