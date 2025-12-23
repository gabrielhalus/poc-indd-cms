import type { SchemaFieldId } from './schema';

export type DocumentId = string;

export type ImageAssetId = string;

export interface ImageRef {
  assetId: ImageAssetId;
  originalFilename?: string;
  format?: 'jpeg' | 'png';
}

export type FieldValue =
  | string
  | number
  | null
  | ImageRef
  | string[]; // For list fields

export type DocumentValues = Record<SchemaFieldId, FieldValue | undefined>;

export interface DocumentRow {
  id: DocumentId;
  values: DocumentValues;
  createdAt: string;
  updatedAt: string;
}


