import { useState } from "react";

interface Props {
  onSubmit: (symptoms: string) => void;
  loading: boolean;
}

export default function SymptomForm({ onSubmit, loading }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  };

  return (
    <form className="symptom-form" onSubmit={handleSubmit}>
      <label htmlFor="symptoms">Опишите симптомы пациента</label>
      <textarea
        id="symptoms"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Например: Высокая температура, сухой кашель, одышка в течение 5 дней..."
        rows={5}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !text.trim()}>
        {loading ? "Анализ..." : "Диагностировать"}
      </button>
    </form>
  );
}
