export type FieldType = 'text' | 'number' | 'textarea' | 'image' | 'list';

export type AspectRatio = '1:1' | '4:3' | '16:9';

export type SchemaFieldId = string;

export interface ImageFieldConfig {
  aspectRatio: AspectRatio;
}

export interface SchemaFieldBase {
  id: SchemaFieldId;
  name: string;
  required: boolean;
  isTitle: boolean;
  order: number;
  status?: 'active' | 'hidden' | 'deleted';
}

export interface TextSchemaField extends SchemaFieldBase {
  type: Extract<FieldType, 'text' | 'number' | 'textarea' | 'list'>;
}

export interface ImageSchemaField extends SchemaFieldBase {
  type: Extract<FieldType, 'image'>;
  imageConfig: ImageFieldConfig;
}

export type SchemaField = TextSchemaField | ImageSchemaField;

export interface Schema {
  id: string;
  version: number;
  fields: SchemaField[];
  createdAt: string;
  updatedAt: string;
  migrationNotes?: string;
}


