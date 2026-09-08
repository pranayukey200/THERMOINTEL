"""
Configuration settings for THERMOINTEL backend.
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "THERMOINTEL"
    PROJECT_DESCRIPTION: str = "AI-Powered Industrial Thermal Intelligence & Monitoring Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Paths
    DATABASE_PATH: str = os.getenv("DATABASE_PATH", str(BASE_DIR / "data" / "thermintel.db"))
    QUICKLOOKS_DIR: str = os.getenv(
        "QUICKLOOKS_DIR", 
        str(BASE_DIR / "data" / "raw" / "sentinel2" / "quicklooks") 
        if (BASE_DIR / "data" / "raw" / "sentinel2" / "quicklooks").exists()
        else str(BASE_DIR / "final" / "sentinel2" / "quicklooks")
    )
    FEATURE_IMPORTANCE_PATH: str = os.getenv(
        "FEATURE_IMPORTANCE_PATH", 
        str(BASE_DIR / "data" / "features" / "random_forest_feature_importance_v1.csv")
    )

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
