from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    QAZCODE_API_KEY: str = ""
    QAZCODE_BASE_URL: str = "https://hub.qazcode.ai/v1"

    model_config = {"env_file": ".env"}

settings = Settings()
