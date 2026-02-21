import type { DiagnosisItem } from "../types";

interface Props {
  diagnoses: DiagnosisItem[];
}

export default function DiagnosisResults({ diagnoses }: Props) {
  if (diagnoses.length === 0) return null;

  return (
    <div className="results">
      <h2>Результаты диагностики</h2>
      <div className="results-list">
        {diagnoses.map((d) => (
          <div key={d.rank} className="diagnosis-card">
            <div className="diagnosis-header">
              <span className="rank">#{d.rank}</span>
              <span className="diagnosis-name">{d.diagnosis}</span>
              <span className="icd-code">{d.icd10_code}</span>
            </div>
            <p className="explanation">{d.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
