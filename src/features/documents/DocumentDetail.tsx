import { useMemo, useState } from 'react';
import type { Schema, AspectRatio, SchemaField } from '../../types/schema';
import type { DocumentRow, FieldValue, ImageRef } from '../../types/document';
import type { ImageAsset } from '../../types/image';
import { useStore } from '../../store/StoreProvider';
import { cropToAspectRatio } from '../../lib/imageProcessing';
import { createId } from '../../lib/id';
import { ImageCropModal } from '../images/ImageCropModal';

interface DocumentDetailProps {
  schema: Schema;
  document: DocumentRow | null;
}

function getAspectRatioStyle(field: SchemaField): React.CSSProperties {
  if (field.type !== 'image' || !field.imageConfig) return {};
  const [w, h] = field.imageConfig.aspectRatio.split(':').map(Number);
  if (!w || !h) return {};
  return { aspectRatio: `${w} / ${h}` };
}

export function DocumentDetail({ schema, document }: DocumentDetailProps) {
  const { state, dispatch } = useStore();
  const [isDroppingOver, setIsDroppingOver] = useState(false);
  const [cropModalState, setCropModalState] = useState<{
    open: boolean;
    file: File | null;
    fieldId: string;
  }>({ open: false, file: null, fieldId: '' });

  const orderedFields = useMemo(
    () => [...schema.fields].sort((a, b) => a.order - b.order),
    [schema.fields],
  );

  const updateValue = (fieldId: string, value: FieldValue) => {
    if (!document) return;
    const updated: DocumentRow = {
      ...document,
      values: {
        ...document.values,
        [fieldId]: value,
      },
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'documents/update', payload: updated });
  };

  const imagesById = useMemo(
    () => Object.fromEntries(state.images.images.map((img) => [img.id, img])),
    [state.images.images],
  );

  const handleImageCropComplete = async (
    file: File,
    _ratio: AspectRatio,
    cropRect: { sx: number; sy: number; width: number; height: number },
  ) => {
    if (!document || !cropModalState.fieldId) return;
    const field = orderedFields.find((f) => f.id === cropModalState.fieldId);
    if (!field || field.type !== 'image' || !field.imageConfig) return;

    const processed = await cropToAspectRatio(file, field.imageConfig.aspectRatio, { cropRect });

    const id = createId();
    const asset: ImageAsset = {
      id,
      documentId: document.id,
      fieldId: field.id,
      blob: processed.blob,
      mimeType: 'image/jpeg',
      width: processed.width,
      height: processed.height,
      aspectRatio: field.imageConfig.aspectRatio,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'images/addOrUpdate', payload: asset });
    const ref: ImageRef = {
      assetId: id,
      originalFilename: file.name,
      format: 'jpeg',
    };
    updateValue(field.id, ref);
    setCropModalState({ open: false, file: null, fieldId: '' });
  };

  if (!document) {
    return (
      <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-white/80 backdrop-blur-sm p-4">
        <p className="text-center text-xs font-medium text-slate-500 sm:text-sm">
          Select a document from the table or create a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-white/50 bg-white/90 backdrop-blur-md p-4 shadow-elevated sm:space-y-6 sm:p-6">
      <h3 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-sm font-bold text-transparent sm:text-base">
        Document details
      </h3>
      <div className="space-y-4">
        {orderedFields.map((field) => {
          const value = document.values[field.id];

          if (field.type === 'image') {
            const ref = value as ImageRef | undefined;
            const asset = ref ? imagesById[ref.assetId] : undefined;
            const hasRefButNoAsset = ref && !asset;
            const inputId = `image-input-${field.id}`;

            const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setCropModalState({ open: true, file, fieldId: field.id });
            };

            const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setIsDroppingOver(false);
              const file = event.dataTransfer.files?.[0];
              if (!file) return;
              setCropModalState({ open: true, file, fieldId: field.id });
            };

            const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setIsDroppingOver(true);
            };

            const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setIsDroppingOver(false);
            };

            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {field.name}
                  {field.required ? (
                    <span className="ml-1 text-red-500">*</span>
                  ) : null}
                </label>
                <div className="flex justify-start">
                  <div className="rounded-xl border border-slate-200/50 border-dashed bg-gradient-to-br from-slate-50/80 to-white/80 p-2 shadow-inner backdrop-blur-sm transition-all hover:border-slate-300/50">
                    <div
                      className="relative overflow-hidden rounded bg-slate-100"
                      onDrop={onDrop}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                    >
                      <label
                        htmlFor={inputId}
                        className="block cursor-pointer"
                      >
                        <input
                          id={inputId}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onFileSelected}
                        />
                        {asset && asset.blob ? (
                          <img
                            src={URL.createObjectURL(asset.blob)}
                            alt={ref?.originalFilename ?? 'Preview'}
                            className="h-[120px] w-auto max-w-full object-contain sm:h-[180px]"
                          />
                        ) : hasRefButNoAsset ? (
                          <div
                            className="flex h-[120px] flex-col items-center justify-center text-[11px] text-slate-400 sm:h-[180px]"
                            style={getAspectRatioStyle(field)}
                          >
                            <span className="text-orange-600">Image reference found but asset missing</span>
                            <span className="mt-1 text-[10px] text-slate-400">
                              Please select a new image
                            </span>
                          </div>
                        ) : (
                          <div
                            className="flex h-[120px] flex-col items-center justify-center text-[11px] text-slate-400 sm:h-[180px]"
                            style={getAspectRatioStyle(field)}
                          >
                            <span>
                              {isDroppingOver
                                ? 'Drop image to use'
                                : 'Click or drop image'}
                            </span>
                            <span className="mt-1 text-[10px] text-slate-400">
                              {field.imageConfig?.aspectRatio} crop
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (field.type === 'list') {
            const listValue: string[] = Array.isArray(value)
              ? value
              : typeof value === 'string' && value.trim() !== ''
                ? value.split(',').map((s) => s.trim()).filter(Boolean)
                : [];

            const addItem = () => {
              updateValue(field.id, [...listValue, '']);
            };

            const updateItem = (index: number, newValue: string) => {
              const updated = [...listValue];
              updated[index] = newValue;
              updateValue(field.id, updated);
            };

            const removeItem = (index: number) => {
              const updated = listValue.filter((_, i) => i !== index);
              updateValue(field.id, updated.length > 0 ? updated : null);
            };

            return (
              <div key={field.id} className="space-y-2">
                <label className="block text-[11px] font-medium text-slate-600">
                  {field.name}
                  {field.required ? (
                    <span className="ml-1 text-red-500">*</span>
                  ) : null}
                </label>
                <div className="space-y-2 rounded-lg border border-slate-200/60 bg-white/80 backdrop-blur-sm p-3 shadow-inner">
                  {listValue.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">No items</p>
                  ) : (
                    listValue.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          className="flex-1 rounded-lg border border-slate-200/60 bg-white/80 px-2.5 py-1.5 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                          value={item}
                          onChange={(event) =>
                            updateItem(index, event.target.value)
                          }
                          placeholder={`Item ${index + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50/80 hover:shadow-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full rounded-lg border border-dashed border-slate-300/60 bg-white/50 px-3 py-2 text-xs font-medium text-slate-600 transition-all hover:border-slate-400 hover:bg-white/80 hover:shadow-sm"
                  >
                    + Add item
                  </button>
                </div>
              </div>
            );
          }

          const stringValue =
            value === null || value === undefined ? '' : String(value);

          return (
            <div key={field.id} className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                {field.name}
                {field.required ? (
                  <span className="ml-1 text-red-500">*</span>
                ) : null}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="min-h-[80px] w-full rounded-lg border border-slate-200/60 bg-white/80 px-3 py-2 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                  value={stringValue}
                  onChange={(event) =>
                    updateValue(field.id, event.target.value)
                  }
                />
              ) : (
                <input
                  className="w-full rounded-lg border border-slate-200/60 bg-white/80 px-3 py-2 text-xs outline-none backdrop-blur-sm transition-all focus:border-slate-400 focus:bg-white focus:shadow-sm"
                  value={stringValue}
                  onChange={(event) =>
                    updateValue(
                      field.id,
                      field.type === 'number'
                        ? event.target.value === ''
                          ? null
                          : Number(event.target.value)
                        : event.target.value,
                    )
                  }
                />
              )}
            </div>
          );
        })}
      </div>
      {cropModalState.open && cropModalState.file ? (() => {
        const field = orderedFields.find((f) => f.id === cropModalState.fieldId);
        const aspectRatio = field && field.type === 'image' && field.imageConfig
          ? field.imageConfig.aspectRatio
          : '1:1';
        return (
          <ImageCropModal
            open={cropModalState.open}
            file={cropModalState.file}
            aspectRatio={aspectRatio}
            onClose={() => setCropModalState({ open: false, file: null, fieldId: '' })}
            onProcessed={handleImageCropComplete}
          />
        );
      })() : null}
    </div>
  );
}


