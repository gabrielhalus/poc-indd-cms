import { useMemo, useState, useCallback, type KeyboardEvent } from 'react';
import type { Schema } from '../../types/schema';
import type { DocumentRow, FieldValue, ImageRef } from '../../types/document';
import { useStore } from '../../store/StoreProvider';
import { Button } from '../../components/ui/button';
import { createId } from '../../lib/id';
import { ImageCell } from './ImageCell';

interface CellCoord {
  rowIndex: number;
  colIndex: number;
}

function getTitleFieldId(schema: Schema | null): string | null {
  if (!schema) return null;
  const titleField = schema.fields.find((f) => f.isTitle);
  return titleField?.id ?? null;
}

function getFieldValue(
  doc: DocumentRow,
  fieldId: string,
): FieldValue | undefined {
  return doc.values[fieldId];
}

export function DocumentGrid() {
  const { state, dispatch } = useStore();
  const schema = state.schema.schema;
  const documents = state.documents.documents;
  const [activeCell, setActiveCell] = useState<CellCoord | null>(null);

  const orderedFields = useMemo(
    () => (schema ? [...schema.fields].sort((a, b) => a.order - b.order) : []),
    [schema],
  );

  const titleFieldId = useMemo(
    () => getTitleFieldId(schema),
    [schema],
  );

  const addRow = () => {
    if (!schema) return;
    const now = new Date().toISOString();
    const newRow: DocumentRow = {
      id: createId(),
      values: {},
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'documents/add', payload: newRow });
  };

  const updateCell = (rowIndex: number, fieldId: string, value: FieldValue) => {
    const target = documents[rowIndex];
    if (!target) return;
    const updated: DocumentRow = {
      ...target,
      values: {
        ...target.values,
        [fieldId]: value,
      },
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'documents/update', payload: updated });
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
      if (!activeCell) return;
      let next: CellCoord | null = null;
      switch (event.key) {
        case 'ArrowRight':
          next = { rowIndex, colIndex: colIndex + 1 };
          break;
        case 'ArrowLeft':
          next = { rowIndex, colIndex: colIndex - 1 };
          break;
        case 'ArrowDown':
          next = { rowIndex: rowIndex + 1, colIndex };
          break;
        case 'ArrowUp':
          next = { rowIndex: rowIndex - 1, colIndex };
          break;
        case 'Enter':
        case 'Tab':
          next = { rowIndex, colIndex: colIndex + 1 };
          break;
        default:
          return;
      }
      event.preventDefault();
      if (!next) return;
      setActiveCell(next);
    },
    [activeCell],
  );

  const validations = useMemo(() => {
    if (!schema) return { titleDuplicates: new Set<string>(), missingRequired: new Set<string>() };

    const titleId = titleFieldId;
    const titleMap = new Map<string, number>();
    const titleDuplicates = new Set<string>();
    const missingRequired = new Set<string>();

    documents.forEach((doc) => {
      schema.fields.forEach((field) => {
        const value = doc.values[field.id];
        if (field.required && (value === undefined || value === null || value === '')) {
          missingRequired.add(doc.id);
        }
      });

      if (titleId) {
        const titleValue = doc.values[titleId];
        if (typeof titleValue === 'string' && titleValue.trim() !== '') {
          const key = titleValue.trim();
          const count = titleMap.get(key) ?? 0;
          titleMap.set(key, count + 1);
          if (count + 1 > 1) {
            titleDuplicates.add(doc.id);
          }
        } else {
          missingRequired.add(doc.id);
        }
      }
    });

    return { titleDuplicates, missingRequired };
  }, [schema, documents, titleFieldId]);

  if (!schema) {
    return (
      <p className="text-xs text-amber-700">
        Define a schema in the Settings tab before editing documents.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500">
          Rows:{' '}
          <span className="font-semibold text-slate-800">{documents.length}</span>
        </div>
        <Button type="button" onClick={addRow} size="sm">Add row</Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-white">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-medium text-slate-500">
            <tr>
              <th className="border-b px-2 py-2">#</th>
              {orderedFields.map((field) => (
                <th key={field.id} className="border-b px-2 py-2">
                  {field.name}
                  {field.required ? <span className="text-red-500"> *</span> : null}
                  {field.isTitle ? (
                    <span className="ml-1 rounded bg-slate-100 px-1 py-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                      title
                    </span>
                  ) : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, rowIndex) => {
              const isRowInvalid =
                validations.missingRequired.has(doc.id) ||
                validations.titleDuplicates.has(doc.id);

              return (
                <tr
                  key={doc.id}
                  className={isRowInvalid ? 'bg-red-50/40' : undefined}
                >
                  <td className="border-t px-2 py-1 text-[11px] text-slate-400">
                    {rowIndex + 1}
                  </td>
                  {orderedFields.map((field, colIndex) => {
                    const value = getFieldValue(doc, field.id);
                    const coordMatch =
                      activeCell?.rowIndex === rowIndex &&
                      activeCell?.colIndex === colIndex;

                    if (field.type === 'image') {
                      return (
                        <td
                          key={field.id}
                          className="border-t px-2 py-1 text-[11px] text-slate-500"
                        >
                          <ImageCell
                            document={doc}
                            field={field}
                            onChange={(ref) =>
                              updateCell(rowIndex, field.id, ref as ImageRef | null)
                            }
                          />
                        </td>
                      );
                    }

                    const displayValue =
                      value === null || value === undefined ? '' : String(value);
                    const isError =
                      field.required &&
                      (displayValue === '' || displayValue.trim() === '');

                    return (
                      <td key={field.id} className="border-t px-2 py-1">
                        <input
                          className={`w-full rounded border px-1 py-0.5 text-[11px] outline-none ${
                            coordMatch
                              ? 'border-slate-500'
                              : 'border-slate-200 focus:border-slate-400'
                          } ${isError ? 'border-red-400 bg-red-50/40' : ''}`}
                          value={displayValue}
                          onChange={(event) =>
                            updateCell(
                              rowIndex,
                              field.id,
                              field.type === 'number'
                                ? event.target.value === ''
                                  ? null
                                  : Number(event.target.value)
                                : event.target.value,
                            )
                          }
                          onFocus={() =>
                            setActiveCell({ rowIndex, colIndex })
                          }
                          onKeyDown={(event) =>
                            handleKeyDown(event, rowIndex, colIndex)
                          }
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


