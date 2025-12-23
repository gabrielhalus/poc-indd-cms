import { useState } from 'react';
import type { DocumentRow, ImageRef } from '../../types/document';
import type { SchemaField } from '../../types/schema';
import type { ImageAsset } from '../../types/image';
import { useStore } from '../../store/StoreProvider';
import { ImageCropModal } from '../images/ImageCropModal';
import { cropToAspectRatio } from '../../lib/imageProcessing';
import { createId } from '../../lib/id';

interface ImageCellProps {
  document: DocumentRow;
  field: SchemaField;
  onChange: (next: ImageRef | null) => void;
}

export function ImageCell({ document, field, onChange }: ImageCellProps) {
  const { state, dispatch } = useStore();
  const [open, setOpen] = useState(false);

  const currentRef = document.values[field.id] as ImageRef | undefined;
  const currentAsset =
    currentRef &&
    state.images.images.find((img) => img.id === currentRef.assetId);

  const handleProcessed = async (
    file: File,
    cropRect: { sx: number; sy: number; width: number; height: number },
  ) => {
    if (field.type !== 'image' || !field.imageConfig) return;
    const processed = await cropToAspectRatio(
      file,
      field.imageConfig.aspectRatio,
      { cropRect },
    );

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
    onChange(ref);
  };

  const label =
    currentAsset && currentRef
      ? `${currentRef.originalFilename ?? 'Image'} (${currentAsset.width}×${currentAsset.height})`
      : 'Click to select image';

  if (field.type !== 'image' || !field.imageConfig) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex w-full items-center justify-between rounded border border-dashed border-slate-300 px-2 py-1 text-left text-[11px] text-slate-600 hover:border-slate-400 hover:bg-slate-50"
        onClick={() => setOpen(true)}
      >
        <span className="truncate">{label}</span>
        <span className="ml-2 text-[10px] uppercase text-slate-400">
          {field.imageConfig.aspectRatio}
        </span>
      </button>
      {/* Note: This component is deprecated. ImageCropModal now requires a file prop. */}
      {open && (
        <ImageCropModal
          open={open}
          file={null}
          aspectRatio={field.imageConfig.aspectRatio}
          onClose={() => setOpen(false)}
          onProcessed={(file, _ratio, rect) => {
            void handleProcessed(file, rect);
          }}
        />
      )}
    </>
  );
}


