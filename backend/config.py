from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://saas_user:saas_password@localhost:5432/saas_db"
    redis_url: str = "redis://:redis_password@localhost:6379/0"

    jwt_secret_key: str = "changeme_in_production_32chars_min"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    cors_origins: str = "http://localhost:3000"
    environment: str = "development"
    login_rate_limit: str = "5/minute"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
