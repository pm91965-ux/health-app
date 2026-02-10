export interface LabResult {
  id: string;
  date: string; // YYYY-MM-DD
  marker: string; // e.g. "Vitamin D"
  value: number;
  unit: string; // e.g. "ng/mL"
  reference_range?: string; // e.g. "30-100"
  notes?: string;
}

export interface LabReport {
  results: LabResult[];
}
