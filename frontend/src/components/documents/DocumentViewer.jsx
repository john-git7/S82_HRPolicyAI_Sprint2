// src/components/documents/DocumentViewer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  Tag,
  Calendar,
} from 'lucide-react';

const ZOOM_LEVELS = [0.75, 1.0, 1.25];
const ZOOM_LABELS = ['75%', '100%', '125%'];

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function DocumentViewer({ doc, isOpen, onClose }) {
  const [page, setPage] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(1); // 100% default

  // Reset page and zoom when a new doc is opened
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setZoomIdx(1);
    }
  }, [isOpen, doc?.id]);

  // Keyboard navigation: Escape to close, Arrow keys for page nav
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        setPage((p) => p + 1);
      } else if (e.key === 'ArrowLeft') {
        setPage((p) => Math.max(1, p - 1));
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !doc) return null;

  const zoom = ZOOM_LEVELS[zoomIdx];
  const fileUrl = doc.fileUrl ? `${doc.fileUrl}#page=${page}` : null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Document Viewer: ${doc.name}`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">{doc.name}</h2>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
              {doc.region && (
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Globe className="w-3 h-3" /> {doc.region}
                </span>
              )}
              {doc.category && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Tag className="w-3 h-3" /> {doc.category}
                  </span>
                </>
              )}
              {doc.effectiveDate && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" /> {formatDate(doc.effectiveDate)}
                  </span>
                </>
              )}
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-mono text-slate-500">v{doc.version || '2026'}</span>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Zoom */}
          <div className="hidden sm:flex items-center gap-1 border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              disabled={zoomIdx === 0}
              onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-600 select-none">
              {ZOOM_LABELS[zoomIdx]}
            </span>
            <button
              type="button"
              disabled={zoomIdx === ZOOM_LEVELS.length - 1}
              onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download */}
          {fileUrl ? (
            <a
              href={fileUrl.split('#')[0]}
              download={doc.filename}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </a>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-50 rounded-lg cursor-not-allowed"
              title="No file stored for this document"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </span>
          )}

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* PDF / fallback area */}
      <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#374151' }}>
        {fileUrl ? (
          <div className="flex-1 overflow-auto flex items-start justify-center p-4" style={{ minHeight: 0 }}>
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                width: '100%',
                maxWidth: '900px',
                transition: 'transform 0.15s ease',
              }}
            >
              <iframe
                key={`${doc.id}-${page}`}
                src={fileUrl}
                title={doc.name}
                className="w-full bg-white rounded shadow-lg"
                style={{ height: 'calc(100vh - 10rem)', border: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: '#4B5563', color: '#9CA3AF' }}
            >
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Preview not available</h3>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              This document is seeded demo data — its original file is not stored on the server.
              Upload a real PDF to enable inline preview and download.
            </p>
            {/* Metadata panel */}
            <div
              className="mt-6 grid grid-cols-2 gap-3 text-left rounded-xl p-4 w-full max-w-sm text-xs"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #4B5563' }}
            >
              <div>
                <span className="text-slate-400 block mb-0.5">Document ID</span>
                <span className="font-mono text-slate-200 break-all text-[10px]">{doc.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Filename</span>
                <span className="text-slate-200 break-words">{doc.filename}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Chunks Indexed</span>
                <span className="text-slate-200">{doc.chunkCount ? doc.chunkCount.toLocaleString() : '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">File Size</span>
                <span className="text-slate-200">{doc.fileSize || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Status</span>
                <span
                  className={`font-semibold ${
                    doc.status === 'Indexed'
                      ? 'text-emerald-400'
                      : doc.status === 'Failed'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Author</span>
                <span className="text-slate-200">{doc.author || 'HR Team'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Page navigation footer */}
      {fileUrl && (
        <div className="flex items-center justify-center gap-4 px-4 py-2.5 bg-white border-t border-slate-200 shrink-0">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous page (Arrow Left)"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-xs text-slate-500 font-medium select-none">
            Page <span className="font-bold text-slate-800">{page}</span>
            <span className="text-slate-300 mx-2">·</span>
            <span className="text-slate-400 text-[10px]">← → to navigate · Esc to close</span>
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Next page (Arrow Right)"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
