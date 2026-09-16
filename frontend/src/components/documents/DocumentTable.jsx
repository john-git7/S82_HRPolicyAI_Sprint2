// src/components/documents/DocumentTable.jsx
import React, { useState } from 'react';
import {
  FileText,
  Trash2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { DocumentStatus } from './DocumentStatus';
import { DocumentViewer } from './DocumentViewer';

export function DocumentTable({
  documents = [],
  onDelete,
  onReindex,
  loading = false,
}) {
  const [viewerDoc, setViewerDoc] = useState(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Version</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Chunks</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => (
                <tr
                  key={doc.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => setViewerDoc(doc)}
                          className="font-medium text-slate-900 hover:text-blue-600 truncate text-left block cursor-pointer"
                        >
                          {doc.name}
                        </button>
                        <p className="text-[11px] text-slate-400 truncate">{doc.filename}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium text-xs">
                      {doc.region || 'Global'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {doc.category || 'General'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                    v{doc.version || '1.0'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <DocumentStatus status={doc.status} errorReason={doc.errorReason} />
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-600">
                    {doc.chunkCount ? doc.chunkCount.toLocaleString() : '—'}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                    {formatDate(doc.updatedAt)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewerDoc(doc)}
                        title="View Document"
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                      >
                        <Info className="w-4 h-4" />
                      </button>

                      {onReindex && (
                        <button
                          type="button"
                          onClick={() => onReindex(doc.id, doc)}
                          title="Re-extract and Re-index into ChromaDB"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
                              onDelete(doc.id);
                            }
                          }}
                          title="Delete document and remove embeddings"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Viewer */}
      {viewerDoc && (
        <DocumentViewer
          doc={viewerDoc}
          isOpen={true}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </>
  );
}
