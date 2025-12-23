import type { DocumentRow } from '../types/document';

export interface DocumentsState {
  documents: DocumentRow[];
}

export type DocumentsAction =
  | { type: 'documents/add'; payload: DocumentRow }
  | { type: 'documents/update'; payload: DocumentRow }
  | { type: 'documents/remove'; payload: { id: string } }
  | { type: 'documents/setAll'; payload: DocumentRow[] };

export const initialDocumentsState: DocumentsState = {
  documents: [],
};

export function documentsReducer(
  state: DocumentsState,
  action: DocumentsAction,
): DocumentsState {
  switch (action.type) {
    case 'documents/add':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'documents/update':
      return {
        ...state,
        documents: state.documents.map((doc) =>
          doc.id === action.payload.id ? action.payload : doc,
        ),
      };
    case 'documents/remove':
      return {
        ...state,
        documents: state.documents.filter((doc) => doc.id !== action.payload.id),
      };
    case 'documents/setAll':
      return { ...state, documents: action.payload };
    default:
      return state;
  }
}


