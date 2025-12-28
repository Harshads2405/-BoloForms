
export enum FieldType {
  TEXT = 'TEXT',
  SIGNATURE = 'SIGNATURE',
  IMAGE = 'IMAGE',
  DATE = 'DATE',
  RADIO = 'RADIO'
}

export interface Field {
  id: string;
  type: FieldType;
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
  w: number; // Percentage (0-100)
  h: number; // Percentage (0-100)
  value?: string;
  page: number;
}

export interface AuditRecord {
  timestamp: string;
  originalHash: string;
  finalHash: string;
  action: string;
}

export interface PDFDimensions {
  width: number;
  height: number;
}
