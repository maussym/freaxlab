import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
CORPUS_DIR = DATA_DIR / "corpus"
VECTORDB_DIR = DATA_DIR / "vectordb"
TEST_SET_DIR = DATA_DIR / "test_set"

# GPT-OSS (LLM)
LLM_BASE_URL = os.getenv("LLM_BASE_URL", "https://hub.qazcode.ai")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "oss-120b")

# Retriever
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
)
TOP_K_CHUNKS = int(os.getenv("TOP_K_CHUNKS", "5"))

# Diagnosis
TOP_N_DIAGNOSES = int(os.getenv("TOP_N_DIAGNOSES", "3"))

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8080"))
