from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    QAZCODE_API_KEY: str = ""
    QAZCODE_BASE_URL: str = "https://hub.qazcode.ai/v1"
    JWT_SECRET: str = "hackathon-secret-change-me"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""

    model_config = {"env_file": ".env"}


settings = Settings()

API_KEY = settings.QAZCODE_API_KEY
HUB_URL = "https://hub.qazcode.ai"
EMBEDDING_MODEL = "intfloat/multilingual-e5-base"
MODEL = "oss-120b"
