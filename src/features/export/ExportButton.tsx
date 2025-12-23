import { useState } from 'react';
import JSZip from 'jszip';
import { useStore } from '../../store/StoreProvider';
import { Button } from '../../components/ui/button';
import { slugify } from '../../lib/slug';
import { toCsv } from '../../lib/csv';
import { Loader2Icon } from 'lucide-react';

export function ExportButton() {
  const { state } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    const schema = state.schema.schema;
    const docs = state.documents.documents;
    const images = state.images.images;

    if (!schema) {
      setError('Define a schema before exporting.');
      return;
    }
    if (docs.length === 0) {
      setError('No documents to export.');
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const orderedFields = [...schema.fields].sort((a, b) => a.order - b.order);
      const titleField = orderedFields.find((f) => f.isTitle);
      if (!titleField) {
        throw new Error('Schema must define a title field before export.');
      }

      // Validation
      const titleMap = new Map<string, string>(); // title -> docId
      for (const doc of docs) {
        const titleValue = doc.values[titleField.id];
        if (typeof titleValue !== 'string' || titleValue.trim() === '') {
          throw new Error('All documents must have a non-empty title before export.');
        }
        const key = titleValue.trim();
        if (titleMap.has(key)) {
          throw new Error(
            `Duplicate title "${key}" found. Titles must be unique for export.`,
          );
        }
        titleMap.set(key, doc.id);

        for (const field of orderedFields) {
          const value = doc.values[field.id];
          if (!field.required) continue;
          if (field.type === 'image') {
            const ref = value as { assetId?: string } | undefined;
            if (!ref?.assetId) {
              throw new Error(
                `Required image field "${field.name}" is missing for document "${key}".`,
              );
            }
            const asset = images.find((img) => img.id === ref.assetId);
            if (!asset) {
              throw new Error(
                `Image asset missing for field "${field.name}" in document "${key}".`,
              );
            }
          } else if (field.type === 'list') {
            const listValue = Array.isArray(value) ? value : [];
            if (listValue.length === 0) {
              throw new Error(
                `Required list field "${field.name}" is empty for document "${key}".`,
              );
            }
          } else if (value === undefined || value === null || value === '') {
            throw new Error(
              `Required field "${field.name}" is empty for document "${key}".`,
            );
          }
        }
      }

      const zip = new JSZip();
      const imageFolder = zip.folder('images');
      if (!imageFolder) {
        throw new Error('Failed to create images folder in ZIP.');
      }

      const csvRows: string[][] = [];
      // Header
      csvRows.push(orderedFields.map((f) => f.name));

      for (const doc of docs) {
        const titleValue = String(doc.values[titleField.id] ?? '');
        const baseSlug = slugify(titleValue);

        const row: string[] = [];
        for (const field of orderedFields) {
          const value = doc.values[field.id];
          if (field.type === 'image') {
            const ref = value as { assetId?: string } | undefined;
            if (!ref?.assetId) {
              row.push('');
              continue;
            }
            const asset = images.find((img) => img.id === ref.assetId);
            if (!asset) {
              row.push('');
              continue;
            }
            const fieldSlug = slugify(field.name);
            const filename = `${baseSlug}-${fieldSlug}.jpg`;
            const path = `images/${filename}`;
            imageFolder.file(filename, asset.blob);
            row.push(path);
          } else if (field.type === 'list') {
            const listValue = Array.isArray(value) ? value.filter(Boolean) : [];
            row.push(listValue.join(';')); // Use semicolon separator for CSV compatibility
          } else if (typeof value === 'number') {
            row.push(String(value));
          } else if (value === null || value === undefined) {
            row.push('');
          } else {
            row.push(String(value));
          }
        }

        csvRows.push(row);
      }

      const csvContent = toCsv(csvRows);
      zip.file('data.csv', csvContent);
      const blob = await zip.generateAsync({ type: 'blob' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'export.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
      <Button type="button" onClick={handleExport} disabled={isExporting} size="sm">
        {isExporting ? <Loader2Icon className="size-4 animate-spin" /> : 'Export CSV + images'}
      </Button>
      {error ? (
        <span className="text-xs text-red-600">{error}</span>
      ) : null}
    </div>
  );
}


