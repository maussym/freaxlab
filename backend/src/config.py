from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    QAZCODE_API_KEY: str = "YOUR_API_KEY_HERE"
    QAZCODE_BASE_URL: str = "https://hub.qazcode.ai/v1"

settings = Settings()
