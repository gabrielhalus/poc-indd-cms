import { useEffect, useState, useRef } from 'react';
import type { AspectRatio } from '@/types/schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2Icon } from 'lucide-react';

interface ImageCropModalProps {
  open: boolean;
  file: File | null;
  onClose: () => void;
  onProcessed: (
    file: File,
    ratio: AspectRatio,
    cropRect: { sx: number; sy: number; width: number; height: number },
  ) => void;
  aspectRatio: AspectRatio;
}

export function ImageCropModal({
  open,
  file,
  onClose,
  onProcessed,
  aspectRatio,
}: ImageCropModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [crop, setCrop] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const [dragState, setDragState] = useState<
    | null
    | {
      mode: 'move' | 'resize';
      startX: number;
      startY: number;
      initialCrop: { x: number; y: number; width: number; height: number };
    }
  >(null);

  useEffect(() => {
    if (!open || !file) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setIsProcessing(false);
      setError(null);
      setImageSize(null);
      setContainerSize(null);
      setCrop(null);
      return;
    }

    // Load the file when it's provided
    setError(null);
    const img = new Image();
    img.onload = () => {
      setImageSize({ width: img.width, height: img.height });
    };
    const url = URL.createObjectURL(file);
    img.src = url;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
  }, [open, file]);

  const handleConfirm = async () => {
    if (!file) {
      setError('Please choose an image file.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      if (!imageSize || !containerSize || !crop) {
        throw new Error('Image preview not ready.');
      }

      const imgAspect = imageSize.width / imageSize.height;
      const containerAspect = containerSize.width / containerSize.height;
      const scale =
        imgAspect > containerAspect
          ? containerSize.width / imageSize.width
          : containerSize.height / imageSize.height;

      const displayWidth = imageSize.width * scale;
      const displayHeight = imageSize.height * scale;
      const offsetX = (containerSize.width - displayWidth) / 2;
      const offsetY = (containerSize.height - displayHeight) / 2;

      const sx = (crop.x - offsetX) / scale;
      const sy = (crop.y - offsetY) / scale;
      const width = crop.width / scale;
      const height = crop.height / scale;

      onProcessed(file, aspectRatio, { sx, sy, width, height });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePointerDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    mode: 'move' | 'resize',
  ) => {
    if (!crop) return;
    event.preventDefault();
    setDragState({
      mode,
      startX: event.clientX,
      startY: event.clientY,
      initialCrop: { ...crop },
    });
  };

  const handlePointerMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!dragState || !containerSize || !imageSize) return;
    event.preventDefault();

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;
    const { initialCrop } = dragState;

    const imgAspect = imageSize.width / imageSize.height;
    const containerAspect = containerSize.width / containerSize.height;
    const scale =
      imgAspect > containerAspect
        ? containerSize.width / imageSize.width
        : containerSize.height / imageSize.height;

    const displayWidth = imageSize.width * scale;
    const displayHeight = imageSize.height * scale;
    const offsetX = (containerSize.width - displayWidth) / 2;
    const offsetY = (containerSize.height - displayHeight) / 2;

    const imgLeft = offsetX;
    const imgTop = offsetY;
    const imgRight = offsetX + displayWidth;
    const imgBottom = offsetY + displayHeight;

    if (dragState.mode === 'move') {
      let nextX = initialCrop.x + deltaX;
      let nextY = initialCrop.y + deltaY;
      nextX = Math.max(imgLeft, Math.min(imgRight - initialCrop.width, nextX));
      nextY = Math.max(imgTop, Math.min(imgBottom - initialCrop.height, nextY));
      setCrop({ ...initialCrop, x: nextX, y: nextY });
    } else {
      // resize from bottom-right while keeping top-left fixed and aspect ratio constant
      const desiredAspect = (() => {
        const [w, h] = aspectRatio.split(':').map(Number);
        return !w || !h ? 1 : w / h;
      })();

      let newWidth = initialCrop.width + deltaX;
      if (newWidth < 20) newWidth = 20;
      let newHeight = newWidth / desiredAspect;

      if (initialCrop.y + newHeight > imgBottom) {
        newHeight = imgBottom - initialCrop.y;
        newWidth = newHeight * desiredAspect;
      }
      if (initialCrop.x + newWidth > imgRight) {
        newWidth = imgRight - initialCrop.x;
        newHeight = newWidth / desiredAspect;
      }

      setCrop({
        x: initialCrop.x,
        y: initialCrop.y,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handlePointerUp = () => {
    setDragState(null);
  };

  const handleContainerRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const nextSize = { width: rect.width, height: rect.height };

    // Avoid re-setting if size hasn't changed to prevent update loops.
    if (
      !containerSize ||
      containerSize.width !== nextSize.width ||
      containerSize.height !== nextSize.height
    ) {
      setContainerSize(nextSize);
    }

    // Initialize crop region once, when we first know container size & image size.
    if (!crop && imageSize && !dragState) {
      const imgAspect = imageSize.width / imageSize.height;
      const containerAspect = rect.width / rect.height;
      const scale =
        imgAspect > containerAspect
          ? rect.width / imageSize.width
          : rect.height / imageSize.height;
      const displayWidth = imageSize.width * scale;
      const displayHeight = imageSize.height * scale;
      const offsetX = (rect.width - displayWidth) / 2;
      const offsetY = (rect.height - displayHeight) / 2;

      const boxWidth = displayWidth * 0.7;
      const desiredAspect = (() => {
        const [w, h] = aspectRatio.split(':').map(Number);
        return !w || !h ? 1 : w / h;
      })();
      const boxHeight = boxWidth / desiredAspect;

      const x = offsetX + (displayWidth - boxWidth) / 2;
      const y = offsetY + (displayHeight - boxHeight) / 2;

      setCrop({
        x,
        y,
        width: boxWidth,
        height: boxHeight,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md !top-[5%] !translate-y-0 !translate-x-[-50%]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Adjust the crop window to match ratio <strong>{aspectRatio}</strong>. Drag to move, resize from bottom-right corner.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          {previewUrl && file ? (
            <div className="mt-2">
              <div
                ref={handleContainerRef}
                className="relative h-96 w-full overflow-hidden rounded-xl border border-slate-200/50 bg-slate-100 shadow-inner"
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onMouseLeave={handlePointerUp}
              >
                {/* Base image layer */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-contain"
                  draggable={false}
                />
                {crop && containerSize ? (
                  <>
                    {/* Top overlay */}
                    <div
                      className="absolute backdrop-blur-[2px] bg-black/20 pointer-events-none"
                      style={{
                        left: 0,
                        top: 0,
                        width: containerSize.width,
                        height: crop.y,
                      }}
                    />
                    {/* Bottom overlay */}
                    <div
                      className="absolute backdrop-blur-[2px] bg-black/20 pointer-events-none"
                      style={{
                        left: 0,
                        top: crop.y + crop.height,
                        width: containerSize.width,
                        height: containerSize.height - (crop.y + crop.height),
                      }}
                    />
                    {/* Left overlay */}
                    <div
                      className="absolute backdrop-blur-[2px] bg-black/20 pointer-events-none"
                      style={{
                        left: 0,
                        top: crop.y,
                        width: crop.x,
                        height: crop.height,
                      }}
                    />
                    {/* Right overlay */}
                    <div
                      className="absolute backdrop-blur-[2px] bg-black/20 pointer-events-none"
                      style={{
                        left: crop.x + crop.width,
                        top: crop.y,
                        width: containerSize.width - (crop.x + crop.width),
                        height: crop.height,
                      }}
                    />
                    {/* Crop box border and controls */}
                    <div
                      className="absolute border-2 border-sky-500 bg-transparent z-10"
                      style={{
                        left: crop.x,
                        top: crop.y,
                        width: crop.width,
                        height: crop.height,
                        cursor: dragState?.mode === 'move' ? 'grabbing' : 'move',
                        boxShadow: '0 0 0 1px rgba(14, 165, 233, 0.5) inset, 0 0 12px rgba(14, 165, 233, 0.3)',
                      }}
                      onMouseDown={(event) => handlePointerDown(event, 'move')}
                    />
                    {/* Resize handle */}
                    <div
                      className="absolute h-5 w-5 rounded-full border-2 border-sky-500 bg-white shadow-lg shadow-sky-500/40 hover:scale-110 transition-transform z-20"
                      style={{
                        left: crop.x + crop.width - 10,
                        top: crop.y + crop.height - 10,
                        cursor: 'nwse-resize',
                      }}
                      onMouseDown={(event) => handlePointerDown(event, 'resize')}
                    />
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="text-xs text-red-600">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2Icon className="size-4 animate-spin" /> : 'Use image'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


