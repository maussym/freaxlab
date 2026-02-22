import io
import json

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

from src.schemas.chat import ChatMessage


def generate_pdf(session_title: str, messages: list[ChatMessage]) -> bytes:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("Title2", parent=styles["Title"], fontSize=16, spaceAfter=12)
    user_style = ParagraphStyle("User", parent=styles["Normal"], fontSize=10, textColor="#333333", spaceAfter=6)
    assistant_style = ParagraphStyle("Asst", parent=styles["Normal"], fontSize=10, textColor="#0066cc", spaceAfter=6)
    meta_style = ParagraphStyle("Meta", parent=styles["Normal"], fontSize=8, textColor="#999999")

    story = []
    story.append(Paragraph(f"FreaxLab — {session_title}", title_style))
    story.append(Spacer(1, 6 * mm))

    for msg in messages:
        role_label = "Patient" if msg.role == "user" else "AI Assistant"
        style = user_style if msg.role == "user" else assistant_style
        story.append(Paragraph(f"<b>{role_label}</b> ({msg.created_at}):", meta_style))
        content_safe = msg.content.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br/>")
        story.append(Paragraph(content_safe, style))

        if msg.diagnoses:
            for d in msg.diagnoses:
                diag_text = f"#{d.rank} {d.diagnosis} ({d.icd10_code}) — {d.explanation}"
                diag_safe = diag_text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                story.append(Paragraph(diag_safe, assistant_style))

        story.append(Spacer(1, 3 * mm))

    doc.build(story)
    return buf.getvalue()


def generate_json_export(session_title: str, messages: list[ChatMessage]) -> str:
    data = {
        "title": session_title,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "diagnoses": [d.model_dump() for d in m.diagnoses],
                "created_at": m.created_at,
            }
            for m in messages
        ],
    }
    return json.dumps(data, ensure_ascii=False, indent=2)
