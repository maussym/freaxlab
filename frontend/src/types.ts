export interface DiagnosisItem {
  rank: number;
  diagnosis: string;
  icd10_code: string;
  explanation: string;
  confidence?: number; 
}

export interface DiagnoseResponse {
  diagnoses: DiagnosisItem[];
}

export interface DiagnoseRequest {
  symptoms: string;
}
