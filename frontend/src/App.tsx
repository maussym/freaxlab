import { useState } from "react";
import SymptomForm from "./components/SymptomForm";
import DiagnosisResults from "./components/DiagnosisResults";
import ErrorMessage from "./components/ErrorMessage";
import { fetchDiagnosis } from "./api";
import type { DiagnosisItem } from "./types";
import "./App.css";

export default function App() {
  const [diagnoses, setDiagnoses] = useState<DiagnosisItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (symptoms: string) => {
    setLoading(true);
    setError(null);
    setDiagnoses([]);

    try {
      const data = await fetchDiagnosis({ symptoms });
      setDiagnoses(data.diagnoses);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла непредвиденная ошибка"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>MedAssist KZ</h1>
        <p className="subtitle">
          Клиническая система поддержки принятия решений
        </p>
      </header>

      <main>
        <SymptomForm onSubmit={handleSubmit} loading={loading} />
        {error && <ErrorMessage message={error} />}
        <DiagnosisResults diagnoses={diagnoses} />
      </main>

      <footer>
        <p>
          Datasaur 2026 &middot; Qazcode Challenge &middot; Команда &lt;freaks&gt;
        </p>
        <p className="disclaimer">
          Система предназначена для информационной поддержки и не заменяет
          консультацию врача.
        </p>
      </footer>
    </div>
  );
}
