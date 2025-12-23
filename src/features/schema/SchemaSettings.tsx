import { useMemo } from 'react';
import type { SchemaField, FieldType, AspectRatio, Schema } from '@/types/schema';
import { useStore } from '@/store/StoreProvider';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { createId } from '@/lib/id';

const aspectRatios: AspectRatio[] = ['1:1', '4:3', '16:9'];
const fieldTypes: FieldType[] = ['text', 'number', 'textarea', 'image', 'list'];

function createInitialSchema(): Schema {
  const now = new Date().toISOString();

  const fields: SchemaField[] = [
    {
      id: createId(),
      name: 'title',
      type: 'text',
      required: true,
      isTitle: true,
      order: 0,
      status: 'active',
    },
    {
      id: createId(),
      name: 'subtitle',
      type: 'text',
      required: false,
      isTitle: false,
      order: 1,
      status: 'active',
    },
    {
      id: createId(),
      name: 'category',
      type: 'text',
      required: false,
      isTitle: false,
      order: 13,
      status: 'active',
    },
    {
      id: createId(),
      name: 'quote',
      type: 'textarea',
      required: false,
      isTitle: false,
      order: 2,
      status: 'active',
    },
    {
      id: createId(),
      name: 'img',
      type: 'image',
      required: false,
      isTitle: false,
      order: 3,
      status: 'active',
      imageConfig: { aspectRatio: '16:9' },
    },
    {
      id: createId(),
      name: 'intro',
      type: 'textarea',
      required: false,
      isTitle: false,
      order: 4,
      status: 'active',
    },
    {
      id: createId(),
      name: 'paragraph',
      type: 'textarea',
      required: false,
      isTitle: false,
      order: 5,
      status: 'active',
    },
    {
      id: createId(),
      name: 'key-number',
      type: 'number',
      required: false,
      isTitle: false,
      order: 6,
      status: 'active',
    },
    {
      id: createId(),
      name: 'creation-year',
      type: 'number',
      required: false,
      isTitle: false,
      order: 7,
      status: 'active',
    },
    {
      id: createId(),
      name: 'key-markets',
      type: 'list',
      required: false,
      isTitle: false,
      order: 8,
      status: 'active',
    },
    {
      id: createId(),
      name: 'technology',
      type: 'textarea',
      required: false,
      isTitle: false,
      order: 9,
      status: 'active',
    },
    {
      id: createId(),
      name: 'logo',
      type: 'image',
      required: false,
      isTitle: false,
      order: 10,
      status: 'active',
      imageConfig: { aspectRatio: '1:1' },
    },
    {
      id: createId(),
      name: 'website',
      type: 'text',
      required: false,
      isTitle: false,
      order: 11,
      status: 'active',
    },
    {
      id: createId(),
      name: 'credits',
      type: 'textarea',
      required: false,
      isTitle: false,
      order: 12,
      status: 'active',
    },
  ];

  return {
    id: createId(),
    version: 1,
    fields,
    createdAt: now,
    updatedAt: now,
  };
}

export function SchemaSettings() {
  const { state, dispatch } = useStore();
  const schema = state.schema.schema ?? createInitialSchema();

  const hasTitleField = useMemo(
    () => schema.fields.some((f) => f.isTitle),
    [schema.fields],
  );

  const setSchema = (next: Schema) => {
    dispatch({ type: 'schema/set', payload: { ...next, updatedAt: new Date().toISOString() } });
  };

  const handleAddField = () => {
    const nextOrder = schema.fields.length;
    const newField: SchemaField = {
      id: createId(),
      name: `Field ${nextOrder + 1}`,
      type: 'text',
      required: false,
      isTitle: !hasTitleField && nextOrder === 0,
      order: nextOrder,
      status: 'active',
    };
    setSchema({ ...schema, fields: [...schema.fields, newField] });
  };

  const handleFieldChange = (
    id: string,
    changes: Partial<Omit<SchemaField, 'id' | 'order'>>,
  ) => {
    const updatedFields = schema.fields.map((field) => {
      if (field.id !== id) return field;
      // Type assertion needed because spreading doesn't preserve discriminated union
      const next = { ...field, ...changes } as SchemaField;
      return next;
    });

    // Ensure exactly one title field
    if (changes.isTitle) {
      const updatedWithSingleTitle = updatedFields.map((field) => ({
        ...field,
        isTitle: field.id === id,
      }));
      setSchema({ ...schema, fields: updatedWithSingleTitle });
      return;
    }

    setSchema({ ...schema, fields: updatedFields });
  };

  const handleDeleteField = (id: string) => {
    const remaining = schema.fields.filter((field) => field.id !== id);
    if (remaining.length === 0) {
      // Prevent deleting last field – especially title
      return;
    }
    // Re-normalize order
    const reordered = remaining
      .sort((a, b) => a.order - b.order)
      .map((field, index) => ({ ...field, order: index }));
    setSchema({ ...schema, fields: reordered });
  };

  const handleMoveField = (id: string, direction: 'up' | 'down') => {
    const sorted = [...schema.fields].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((f) => f.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const swapped = [...sorted];
    const temp = swapped[index];
    swapped[index] = swapped[targetIndex];
    swapped[targetIndex] = temp;

    const reOrdered = swapped.map((field, idx) => ({ ...field, order: idx }));
    setSchema({ ...schema, fields: reOrdered });
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent">
            Schema Settings
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Define fields, order, and the unique title field for your dataset.
          </p>
        </div>
        <Button onClick={handleAddField}>Add field</Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-white/50 bg-white/90 backdrop-blur-md shadow-elevated">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Aspect ratio</TableHead>
              <TableHead>Required</TableHead>
              <TableHead>Title field</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schema.fields
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((field, index, all) => {
                const isImage = field.type === 'image';
                const isOnlyField = all.length === 1;
                const isFirst = index === 0;
                const isLast = index === all.length - 1;
                const imageAspect =
                  field.type === 'image'
                    ? field.imageConfig?.aspectRatio ?? '1:1'
                    : '1:1';

                return (
                  <TableRow key={field.id} className="transition-colors">
                    <TableCell className="text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <span>{index + 1}</span>
                        <div className="flex flex-col gap-0.5">
                          <button
                            type="button"
                            className="text-[10px] text-slate-400 disabled:opacity-40"
                            disabled={isFirst}
                            onClick={() => handleMoveField(field.id, 'up')}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="text-[10px] text-slate-400 disabled:opacity-40"
                            disabled={isLast}
                            onClick={() => handleMoveField(field.id, 'down')}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <input
                        className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1.5 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                        value={field.name}
                        onChange={(event) =>
                          handleFieldChange(field.id, { name: event.target.value })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1.5 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                        value={field.type}
                        onChange={(event) =>
                          handleFieldChange(field.id, {
                            type: event.target.value as FieldType,
                          })
                        }
                      >
                        {fieldTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      {isImage ? (
                        <select
                          className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1.5 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                          value={imageAspect}
                          onChange={(event) =>
                            handleFieldChange(field.id, {
                              type: 'image',
                              imageConfig: {
                                aspectRatio: event.target.value as AspectRatio,
                              },
                            } as SchemaField)
                          }
                        >
                          {aspectRatios.map((ratio) => (
                            <option key={ratio} value={ratio}>
                              {ratio}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400">n/a</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-400/20"
                        checked={field.required}
                        onChange={(event) =>
                          handleFieldChange(field.id, {
                            required: event.target.checked,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <input
                        type="radio"
                        name="titleField"
                        className="h-4 w-4 cursor-pointer border-slate-300 text-slate-600 focus:ring-2 focus:ring-slate-400/20"
                        checked={field.isTitle}
                        onChange={() =>
                          handleFieldChange(field.id, {
                            isTitle: true,
                            required: true,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 px-2 text-xs"
                        disabled={isOnlyField || field.isTitle}
                        onClick={() => handleDeleteField(field.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}


