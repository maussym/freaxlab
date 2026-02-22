from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from src.config import settings
from src.database import init_db
from src.logger import logger
from src.services.ml_service import MedicalDiagnosisService

from src.api.endpoints import auth, chat, history, export, body_map

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
    logger.info("Server startup: Initializing database...")
    await init_db()
    logger.info("Database initialized.")
    logger.info("Server startup: Initializing services...")
    app.state.ml_service = MedicalDiagnosisService()
    logger.info("MedicalDiagnosisService initialized successfully.")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(history.router)
app.include_router(export.router)
app.include_router(body_map.router)

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
