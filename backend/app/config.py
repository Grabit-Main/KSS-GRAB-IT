from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env", "../.env"],
        extra="ignore"
    )
    supabase_url: str = ""
    supabase_publishable_key: str = ""
    next_public_supabase_url: str = ""
    next_public_supabase_publishable_key: str = ""
    upstash_redis_rest_url: str = ""
    upstash_redis_rest_token: str = ""
    cloudinary_url: str = ""
    jwt_secret: str = ""
    cors_origins: str = "https://grabit-main.vercel.app,http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:5175"
    otp_debug: bool = False

    @property
    def origins(self):
        return [v.strip() for v in self.cors_origins.split(",") if v.strip()]

@lru_cache
def settings() -> Settings:
    return Settings()
