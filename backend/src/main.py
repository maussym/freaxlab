from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.config import settings
from src.logger import logger
from src.services.ml_service import MedicalDiagnosisService

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

class DiagnoseRequest(BaseModel):
    symptoms: str

class DiagnosisItem(BaseModel):
    rank: int
    diagnosis: str
    icd10_code: str
    explanation: str

class DiagnoseResponse(BaseModel):
    diagnoses: list[DiagnosisItem]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ML-TEAM: ИНИЦИАЛИЗАЦИЯ ВЕКТОРНОЙ БАЗЫ И ПРОМПТОВ ЗДЕСЬ (выполняется 1 раз при старте)
    logger.info("Server startup: Initializing services...")
    app.state.ml_service = MedicalDiagnosisService()
    logger.info("MedicalDiagnosisService initialized successfully.")
    yield

app = FastAPI(lifespan=lifespan)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception during request processing: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)}
    )

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(request_data: DiagnoseRequest, request: Request):
    ml_service: MedicalDiagnosisService = request.app.state.ml_service
    diagnoses = await ml_service.predict(request_data.symptoms)
    return DiagnoseResponse(diagnoses=diagnoses)

if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = STATIC_DIR / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(STATIC_DIR / "index.html")
