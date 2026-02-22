from src.schemas.body_map import BodyZone

BODY_ZONES: list[BodyZone] = [
    BodyZone(
        id="head",
        name_ru="Голова", name_kk="Бас", name_en="Head",
        symptoms_ru=["Головная боль", "Головокружение", "Мигрень"],
        symptoms_kk=["Бас ауруы", "Бас айналуы", "Мигрень"],
        symptoms_en=["Headache", "Dizziness", "Migraine"],
    ),
    BodyZone(
        id="throat",
        name_ru="Горло", name_kk="Тамақ", name_en="Throat",
        symptoms_ru=["Боль в горле", "Першение", "Затруднённое глотание"],
        symptoms_kk=["Тамақ ауруы", "Тамақ қышуы", "Жұтыну қиындауы"],
        symptoms_en=["Sore throat", "Tickling", "Difficulty swallowing"],
    ),
    BodyZone(
        id="chest",
        name_ru="Грудная клетка", name_kk="Кеуде", name_en="Chest",
        symptoms_ru=["Боль в груди", "Одышка", "Кашель"],
        symptoms_kk=["Кеуде ауруы", "Ентігу", "Жөтел"],
        symptoms_en=["Chest pain", "Shortness of breath", "Cough"],
    ),
    BodyZone(
        id="abdomen",
        name_ru="Живот", name_kk="Іш", name_en="Abdomen",
        symptoms_ru=["Боль в животе", "Тошнота", "Вздутие"],
        symptoms_kk=["Іш ауруы", "Жүрек айну", "Іш кебуі"],
        symptoms_en=["Abdominal pain", "Nausea", "Bloating"],
    ),
    BodyZone(
        id="back",
        name_ru="Спина", name_kk="Арқа", name_en="Back",
        symptoms_ru=["Боль в пояснице", "Боль между лопатками", "Скованность"],
        symptoms_kk=["Бел ауруы", "Жауырын аралығы ауру", "Қимылдау қиындығы"],
        symptoms_en=["Lower back pain", "Pain between shoulder blades", "Stiffness"],
    ),
    BodyZone(
        id="limbs",
        name_ru="Конечности", name_kk="Аяқ-қол", name_en="Limbs",
        symptoms_ru=["Боль в суставах", "Онемение", "Слабость в мышцах"],
        symptoms_kk=["Буын ауруы", "Ұю", "Бұлшық ет әлсіздігі"],
        symptoms_en=["Joint pain", "Numbness", "Muscle weakness"],
    ),
    BodyZone(
        id="skin",
        name_ru="Кожа", name_kk="Тері", name_en="Skin",
        symptoms_ru=["Сыпь", "Зуд", "Покраснение"],
        symptoms_kk=["Бөртпе", "Қышу", "Қызару"],
        symptoms_en=["Rash", "Itching", "Redness"],
    ),
]

ZONES_MAP = {z.id: z for z in BODY_ZONES}


def zones_to_symptoms_text(zone_ids: list[str], lang: str = "ru") -> str:
    symptoms = []
    for zid in zone_ids:
        zone = ZONES_MAP.get(zid)
        if not zone:
            continue
        if lang == "kk":
            symptoms.extend(zone.symptoms_kk)
        elif lang == "en":
            symptoms.extend(zone.symptoms_en)
        else:
            symptoms.extend(zone.symptoms_ru)
    return ", ".join(symptoms)
