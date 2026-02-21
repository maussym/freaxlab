import type { DiagnoseRequest, DiagnoseResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function fetchDiagnosis(
  request: DiagnoseRequest
): Promise<DiagnoseResponse> {
  const res = await fetch(`${API_BASE}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Ошибка сервера: ${res.status}`);
  }

  return res.json();
}
