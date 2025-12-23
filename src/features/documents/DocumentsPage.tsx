import { useState, useMemo, useEffect } from 'react';
import { useStore } from '../../store/StoreProvider';
import { ExportButton } from '../export/ExportButton';
import { Button } from '../../components/ui/button';
import { createId } from '../../lib/id';
import { DocumentList } from './DocumentList';
import { DocumentDetail } from './DocumentDetail';
import type { DocumentRow } from '../../types/document';
import type { Schema, SchemaField } from '../../types/schema';

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
      type: 'textarea',
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
    {
      id: createId(),
      name: 'category',
      type: 'text',
      required: false,
      isTitle: false,
      order: 13,
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

export function DocumentsPage() {
  const { state, dispatch } = useStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Auto-initialize schema if missing
  useEffect(() => {
    if (!state.schema.schema) {
      dispatch({ type: 'schema/set', payload: createInitialSchema() });
    }
  }, [state.schema.schema, dispatch]);

  const schema = state.schema.schema ?? createInitialSchema();
  const documents = state.documents.documents;

  const selectedDocument: DocumentRow | null = useMemo(
    () => documents.find((doc) => doc.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const handleAddDocument = () => {
    const now = new Date().toISOString();
    const newDoc: DocumentRow = {
      id: createId(),
      values: {},
      createdAt: now,
      updatedAt: now,
    };
    dispatch({ type: 'documents/add', payload: newDoc });
    setSelectedId(newDoc.id);
    setSelectedIds((prev) => [...prev, newDoc.id]);
  };

  const handleDeleteDocument = (id: string) => {
    dispatch({ type: 'documents/remove', payload: { id } });
    const remaining = documents.filter((doc) => doc.id !== id);
    if (selectedId === id) {
      setSelectedId(remaining[0]?.id ?? null);
    }
    setSelectedIds((prev) => prev.filter((docId) => docId !== id));
  };

  const handleToggleSelected = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? Array.from(new Set([...prev, id])) : prev.filter((x) => x !== id),
    );
    if (checked) {
      setSelectedId(id);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = documents.map((doc) => doc.id);
      setSelectedIds(allIds);
      if (allIds.length > 0) {
        setSelectedId((current) => current ?? allIds[0]);
      }
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected document(s)? This cannot be undone.`,
      )
    ) {
      return;
    }
    for (const id of selectedIds) {
      dispatch({ type: 'documents/remove', payload: { id } });
    }
    const remaining = documents.filter((doc) => !selectedIds.includes(doc.id));
    setSelectedId(remaining[0]?.id ?? null);
    setSelectedIds([]);
  };

  return (
    <section className="flex h-[calc(100vh-5rem)] flex-col space-y-4">
      <header className="flex items-center justify-between px-1">
        <div>
          <h2 className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-lg font-bold text-transparent">
            Documents
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Manage individual documents and their images; export when ready.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBulkDelete}
              className="text-xs"
            >
              Delete selected ({selectedIds.length})
            </Button>
          ) : null}
          <ExportButton />
          <Button type="button" onClick={handleAddDocument}>
            New document
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-6">
        <aside className="flex w-80 min-w-[260px] flex-col rounded-xl border border-white/50 bg-white/90 backdrop-blur-md shadow-elevated overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-white/80 px-4 py-3 backdrop-blur-sm">
            <span className="text-xs font-semibold text-slate-700">
              Documents
            </span>
            <span className="rounded-full bg-slate-900/10 px-2 py-0.5 text-[11px] font-medium text-slate-600 backdrop-blur-sm">
              {documents.length}
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <DocumentList
              schema={schema}
              documents={documents}
              selectedId={selectedId}
              selectedIds={selectedIds}
              onSelect={setSelectedId}
              onToggleSelected={handleToggleSelected}
              onToggleSelectAll={handleToggleSelectAll}
              onDelete={handleDeleteDocument}
            />
          </div>
        </aside>
        <section className="min-h-0 flex-1 overflow-y-auto">
          <DocumentDetail schema={schema} document={selectedDocument} />
        </section>
      </div>
    </section>
  );
}


