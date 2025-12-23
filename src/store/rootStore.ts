import {
  initialSchemaState,
  schemaReducer,
  type SchemaAction,
  type SchemaState,
} from './schemaStore';
import {
  documentsReducer,
  initialDocumentsState,
  type DocumentsAction,
  type DocumentsState,
} from './documentsStore';
import {
  imagesReducer,
  initialImagesState,
  type ImagesAction,
  type ImagesState,
} from './imagesStore';

export interface RootState {
  schema: SchemaState;
  documents: DocumentsState;
  images: ImagesState;
}

export type RootAction = SchemaAction | DocumentsAction | ImagesAction;

export const initialRootState: RootState = {
  schema: initialSchemaState,
  documents: initialDocumentsState,
  images: initialImagesState,
};

export function rootReducer(state: RootState, action: RootAction): RootState {
  return {
    schema: schemaReducer(state.schema, action as SchemaAction),
    documents: documentsReducer(state.documents, action as DocumentsAction),
    images: imagesReducer(state.images, action as ImagesAction),
  };
}
