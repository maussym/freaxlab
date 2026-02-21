from pydantic import BaseModel


class DiagnoseRequest(BaseModel):
    symptoms: str


class DiagnosisItem(BaseModel):
    rank: int
    diagnosis: str
    icd10_code: str
    explanation: str


class DiagnoseResponse(BaseModel):
    diagnoses: list[DiagnosisItem]
