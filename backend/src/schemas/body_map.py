from pydantic import BaseModel


class BodyZone(BaseModel):
    id: str
    name_ru: str
    name_kk: str
    name_en: str
    symptoms_ru: list[str]
    symptoms_kk: list[str]
    symptoms_en: list[str]


class BodyMapDiagnoseRequest(BaseModel):
    zone_ids: list[str]
    additional_symptoms: str = ""
    lang: str = "ru"
