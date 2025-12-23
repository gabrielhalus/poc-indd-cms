import type { DocumentId } from './document';
import type { SchemaFieldId, AspectRatio } from './schema';

export type ImageAssetId = string;

export interface ImageAsset {
  id: ImageAssetId;
  documentId: DocumentId;
  fieldId: SchemaFieldId;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  createdAt: string;
  updatedAt: string;
}


