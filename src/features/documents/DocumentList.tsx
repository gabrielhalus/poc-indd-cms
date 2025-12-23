import { EllipsisIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { DocumentRow } from '@/types/document';
import type { Schema } from '@/types/schema';

interface DocumentListProps {
  schema: Schema;
  documents: DocumentRow[];
  selectedId: string | null;
  selectedIds: string[];
  onSelect: (id: string) => void;
  onToggleSelected: (id: string, selected: boolean) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onDelete: (id: string) => void;
}

export function DocumentList({
  schema,
  documents,
  selectedId,
  onSelect,
  selectedIds,
  onToggleSelected,
  onToggleSelectAll,
  onDelete,
}: DocumentListProps) {
  const titleFieldId = useMemo(
    () => schema.fields.find((f) => f.isTitle)?.id ?? null,
    [schema.fields],
  );

  const [openMenuForId, setOpenMenuForId] = useState<string | null>(null);

  const allSelected =
    documents.length > 0 &&
    documents.every((doc) => selectedIds.includes(doc.id));

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8 text-center">
              <Checkbox
                checked={allSelected}
                aria-label="Select all documents"
                onChange={(event) =>
                  onToggleSelectAll((event.target as HTMLInputElement).checked)
                }
              />
            </TableHead>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-10 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc, index) => {
            const rawTitle =
              (titleFieldId && doc.values[titleFieldId]) ?? '';
            const title =
              typeof rawTitle === 'string' && rawTitle.trim() !== ''
                ? rawTitle
                : '(untitled)';
            const isSelected = selectedId === doc.id;
            const isChecked = selectedIds.includes(doc.id);

            return (
              <TableRow
                key={doc.id}
                className={`transition-colors duration-150 ${
                  isSelected
                    ? 'bg-gradient-to-r from-sky-50/80 to-blue-50/50 shadow-sm'
                    : ''
                }`}
              >
                <TableCell className="text-center">
                  <Checkbox
                    checked={isChecked}
                    onChange={(event) =>
                      onToggleSelected(
                        doc.id,
                        (event.target as HTMLInputElement).checked,
                      )
                    }
                  />
                </TableCell>
                <TableCell className="text-[11px] font-medium text-slate-500">
                  {index + 1}
                </TableCell>
                <TableCell
                  className="cursor-pointer text-[11px] font-medium text-slate-800 transition-colors hover:text-slate-900"
                  onClick={() => onSelect(doc.id)}
                >
                  {title}
                </TableCell>
                <TableCell className="relative text-right">
                  <DropdownMenu
                    open={openMenuForId === doc.id}
                    onOpenChange={(open) =>
                      setOpenMenuForId(open ? doc.id : null)
                    }
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                      >
                        <EllipsisIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 text-[11px]">
                      <DropdownMenuItem
                        className="text-red-600 hover:bg-red-50"
                        onSelect={() => {
                          if (
                            window.confirm(
                              'Delete this document? This cannot be undone.',
                            )
                          ) {
                            onDelete(doc.id);
                          }
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {documents.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="px-3 py-4 text-center text-[11px] text-slate-400"
              >
                No documents yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}


