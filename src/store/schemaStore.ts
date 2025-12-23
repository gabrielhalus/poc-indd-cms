import type { Schema } from '../types/schema';

export interface SchemaState {
  schema: Schema | null;
}

export type SchemaAction =
  | { type: 'schema/set'; payload: Schema }
  | { type: 'schema/clear' };

export const initialSchemaState: SchemaState = {
  schema: null,
};

export function schemaReducer(
  state: SchemaState,
  action: SchemaAction,
): SchemaState {
  switch (action.type) {
    case 'schema/set':
      return { ...state, schema: action.payload };
    case 'schema/clear':
      return { ...state, schema: null };
    default:
      return state;
  }
}


