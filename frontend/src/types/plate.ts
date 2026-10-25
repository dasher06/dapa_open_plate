export interface CreatePlateRequest {
  fileName: string;
}

export interface CreatePlateResponse {
  id: string;
  generatedName: string;
}

export interface StoredPlateResponse {
  id: string;
  rawName: string;
  generatedName: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  error: string;
}

export interface SessionPlateRecord {
  id: string;
  rawName: string;
  generatedName: string;
  createdAt: string;
}

export type ProcessingStatus = "ready" | "processing" | "success" | "error";

export interface SelectedFileItem {
  id: string; // unique internal tracking id
  file?: File; // original browser File object (present if selected/dropped)
  rawName: string;
  generatedName?: string;
  recordId?: string; // UUID from backend
  status: ProcessingStatus;
  error?: string;
  copied?: boolean;
  downloaded?: boolean;
}
