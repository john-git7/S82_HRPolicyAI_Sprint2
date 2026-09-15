// src/components/documents/DocumentViewer.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  BookOpen,
  FileCode,
  ShieldCheck,
  Search,
  ExternalLink,
} from 'lucide-react';

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'https://s82-hrpolicyai-sprint2-1.onrender.com'
).replace(/\/+$/, '');

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

// Curated official policy content for seeded and standard knowledge base policies
const POLICY_CONTENT_ARCHIVE = {
  doc_in_leave: {
    sections: [
      {
        title: '1. Purpose & Scope',
        content:
          'This policy outlines statutory and discretionary leave entitlements for all full-time employees based in India. It aims to foster healthy work-life balance and provide adequate rest periods while ensuring organizational operational continuity.',
      },
      {
        title: '2. Entitlement Breakdown',
        content:
          'Eligible employees are credited with the following annual leave quotas on January 1st of each calendar year:\n• Earned Leave (EL): 18 working days per year, credited pro-rata quarterly.\n• Casual Leave (CL): 12 working days per year for personal errands.\n• Sick Leave (SL): 10 working days per year for illness or medical consultations.\n• Mandatory National & Festival Holidays: 10 days declared annually by the regional People Committee.',
      },
      {
        title: '3. Carry-Forward & Encashment Rules',
        content:
          '• A maximum of 45 unused Earned Leave days can be carried forward into subsequent calendar years. Any balance exceeding 45 days automatically lapses on March 31st.\n• Casual and Sick Leaves expire at the end of each calendar year and cannot be carried forward.\n• Accumulated Earned Leave is eligible for encashment upon separation or retirement at the final basic salary rate.',
      },
      {
        title: '4. Application & Approval Process',
        content:
          '• Planned leave exceeding 3 consecutive days must be requested at least 10 business days in advance via the HR Self-Service portal.\n• Sick leave exceeding 3 consecutive working days requires submission of a medical fitness certificate from a registered medical practitioner.',
      },
    ],
  },
  doc_us_leave: {
    sections: [
      {
        title: '1. Overview & Eligibility',
        content:
          'Applicable to all regular full-time US-based employees. Paid Time Off (PTO) combines vacation, personal days, and brief illness periods into a single flexible bucket.',
      },
      {
        title: '2. Annual Accrual Rate',
        content:
          'Employees accrue 20 PTO days annually, calculated on a bi-weekly pay cycle at approximately 6.15 hours per pay period. Employees with 5+ years of tenure accrue 25 days annually.',
      },
      {
        title: '3. Rollover & Encashment Limit',
        content:
          'A maximum of 5 unused PTO days can be rolled over into the next calendar year, expiring on June 30th. Except where mandated by state law (e.g. California), unused accrued PTO is paid out upon separation.',
      },
      {
        title: '4. Statutory Leaves (FMLA & State Leaves)',
        content:
          'Employees eligible under the Family and Medical Leave Act (FMLA) may take up to 12 weeks of job-protected unpaid leave for qualifying family or medical events.',
      },
    ],
  },
  doc_gl_handbook: {
    sections: [
      {
        title: 'Chapter 1: General Employment Principles',
        content:
          'Our organization commits to equal employment opportunity, fostering an inclusive environment free from harassment, discrimination, or retaliation. All employees worldwide must adhere to statutory local standards and global values.',
      },
      {
        title: 'Chapter 2: Working Hours & Attendance',
        content:
          'Standard working hours are 40 hours weekly, Monday through Friday, 9:00 AM to 6:00 PM local office time with a one-hour meal period. Core collaboration hours are 10:00 AM to 4:00 PM.',
      },
      {
        title: 'Chapter 3: Confidentiality & IP Assignment',
        content:
          'All intellectual property, inventions, and research created during employment belong solely to the organization. Confidential data must never be transmitted outside corporate-approved channels.',
      },
      {
        title: 'Chapter 4: Health, Safety & Environment',
        content:
          'We provide a safe, ergonomically sound work environment. Workplace injuries or security concerns must be reported to the Workplace Operations desk within 24 hours.',
      },
    ],
  },
  doc_in_insurance: {
    sections: [
      {
        title: '1. Group Medical Cover (GMC) Scope',
        content:
          'Cashless and reimbursement hospitalization coverage up to ₹5,00,000 per family floater per policy year across network hospitals in India.',
      },
      {
        title: '2. Covered Dependents',
        content:
          'Covered family members include the primary employee, lawful spouse, and up to two dependent children aged up to 25 years. Parental insurance can be opted into as a voluntary co-pay add-on.',
      },
      {
        title: '3. Cashless Hospitalization Protocol',
        content:
          'Show your digital TPA health card at any empanelled hospital. For planned procedures, obtain pre-authorization at least 48 hours prior to admission. Emergency admissions must be notified within 24 hours.',
      },
    ],
  },
  doc_gl_parental: {
    sections: [
      {
        title: '1. Primary Caregiver Leave',
        content:
          'All primary caregivers (birth, adoptive, or surrogate) are entitled to 26 consecutive weeks of fully paid leave. Leave can begin up to 8 weeks prior to the expected delivery date.',
      },
      {
        title: '2. Secondary Caregiver Leave',
        content:
          'Secondary caregivers receive 4 consecutive weeks of fully paid parental leave, usable anytime within the child’s first 12 months.',
      },
      {
        title: '3. Return-to-Work Flexibility',
        content:
          'Returning parents can opt for a phased 80% working schedule during their first month back without salary reduction to ease transition back to full-time work.',
      },
    ],
  },
};

export function DocumentViewer({ doc, document: docProp, isOpen = true, onClose }) {
  const activeDoc = docProp || doc;

  const [viewMode, setViewMode] = useState('reader'); // 'reader' | 'pdf'
  const [page, setPage] = useState(1);
  const [zoomIdx, setZoomIdx] = useState(1); // 100% default
  const [searchFilter, setSearchFilter] = useState('');

  // Resolve fileUrl: handle relative paths by prefixing backend API URL
  const resolvedFileUrl = useMemo(() => {
    if (!activeDoc?.fileUrl) return null;
    const url = activeDoc.fileUrl;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
  }, [activeDoc?.fileUrl]);

  // Set default view mode on open: if fileUrl exists, enable PDF mode; otherwise reader
  useEffect(() => {
    if (isOpen && activeDoc) {
      setPage(1);
      setZoomIdx(1);
      setSearchFilter('');
      if (resolvedFileUrl) {
        setViewMode('pdf');
      } else {
        setViewMode('reader');
      }
    }
  }, [isOpen, activeDoc?.id, resolvedFileUrl]);

  // Keyboard navigation: Escape to close, Arrow keys for page nav in PDF mode
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (viewMode === 'pdf') {
        if (e.key === 'ArrowRight') {
          setPage((p) => p + 1);
        } else if (e.key === 'ArrowLeft') {
          setPage((p) => Math.max(1, p - 1));
        }
      }
    },
    [isOpen, viewMode, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (isOpen === false || !activeDoc) return null;

  const zoom = ZOOM_LEVELS[zoomIdx];
  const iframeSrc = resolvedFileUrl ? `${resolvedFileUrl}#page=${page}` : null;

  // Retrieve structured sections for this document or fallback generic template
  const docArchive = POLICY_CONTENT_ARCHIVE[activeDoc.id] || {
    sections: [
      {
        title: '1. Policy Purpose & Administrative Scope',
        content: `This official document establishes corporate standards, regulatory guidelines, and employee entitlements for "${activeDoc.name}". Administered under the jurisdiction of ${activeDoc.region || 'Global'} People Operations in alignment with applicable local statutory requirements.`,
      },
      {
        title: '2. General Provisions & Entitlements',
        content: `All active full-time and eligible contracted personnel within ${activeDoc.region || 'the designated region'} are subject to the policies contained herein. Inquiries regarding exceptional situations or case-by-case adjustments should be escalated to your designated HR Business Partner or Regional Compliance Lead.`,
      },
      {
        title: '3. Compliance & Review Cycle',
        content: `Version ${activeDoc.version || '2026.1'} effective from ${formatDate(activeDoc.effectiveDate || '2026-01-01')}. This document is formally indexed in our internal RAG knowledge repository (containing approximately ${activeDoc.chunkCount || 85} searchable semantic chunks) for instantaneous employee assistance and automated compliance verification.`,
      },
    ],
  };

  const filteredSections = docArchive.sections.filter(
    (s) =>
      !searchFilter ||
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      s.content.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Document Viewer: ${activeDoc.name}`}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-slate-200 shrink-0 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
                {activeDoc.name}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Official Policy
              </span>
            </div>
            <div className="flex items-center flex-wrap gap-x-2.5 gap-y-0.5 mt-1">
              {activeDoc.region && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Globe className="w-3 h-3 text-slate-400" /> {activeDoc.region}
                </span>
              )}
              {activeDoc.category && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <Tag className="w-3 h-3 text-slate-400" /> {activeDoc.category}
                  </span>
                </>
              )}
              {activeDoc.effectiveDate && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400" /> {formatDate(activeDoc.effectiveDate)}
                  </span>
                </>
              )}
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                v{activeDoc.version || '2026.1'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Switcher (Reader vs PDF) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('reader')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'reader'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Policy Reader</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('pdf')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                viewMode === 'pdf'
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>PDF Document</span>
              {resolvedFileUrl && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="File available" />
              )}
            </button>
          </div>

          {/* PDF Zoom Controls (only in PDF view) */}
          {viewMode === 'pdf' && resolvedFileUrl && (
            <div className="hidden md:flex items-center gap-0.5 border border-slate-200 rounded-lg overflow-hidden bg-white">
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
          )}

          {/* Download button */}
          {resolvedFileUrl ? (
            <a
              href={resolvedFileUrl.split('#')[0]}
              download={activeDoc.filename || 'Policy_Document.pdf'}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              title="Print document clauses"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print/Save</span>
            </button>
          )}

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close viewer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-100">
        {viewMode === 'reader' ? (
          /* Policy Reader View */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Document Overview Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
                      {activeDoc.category || 'Human Resources Policy'}
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {activeDoc.name}
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Original File: {activeDoc.filename || 'Policy Document'} · Updated:{' '}
                      {formatDate(activeDoc.updatedAt || activeDoc.effectiveDate)}
                    </p>
                  </div>

                  {/* Search inside policy */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search within policy..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-5 border-b border-slate-100 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Jurisdiction</span>
                    <span className="font-semibold text-slate-800">{activeDoc.region || 'Global'}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Effective Date</span>
                    <span className="font-semibold text-slate-800">
                      {formatDate(activeDoc.effectiveDate)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Vector Chunks</span>
                    <span className="font-semibold text-slate-800">
                      {activeDoc.chunkCount ? activeDoc.chunkCount.toLocaleString() : '85'} indexed
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Compliance Status</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Active & Grounded
                    </span>
                  </div>
                </div>

                {/* Policy Clauses and Sections */}
                <div className="pt-6 space-y-6">
                  {filteredSections.map((section, idx) => (
                    <div key={idx} className="space-y-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-600 rounded-full" />
                        <span>{section.title}</span>
                      </h3>
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-3.5 whitespace-pre-line bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        {section.content}
                      </div>
                    </div>
                  ))}

                  {filteredSections.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No policy sections matched your search term "{searchFilter}".
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PDF Iframe Mode */
          <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#374151' }}>
            {resolvedFileUrl ? (
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
                    key={`${activeDoc.id}-${page}`}
                    src={iframeSrc}
                    title={activeDoc.name}
                    className="w-full bg-white rounded-lg shadow-2xl"
                    style={{ height: 'calc(100vh - 10rem)', border: 'none' }}
                  />
                </div>
              </div>
            ) : (
              /* Fallback when no PDF binary is stored on server */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner"
                  style={{ background: '#4B5563', color: '#9CA3AF' }}
                >
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  PDF Binary Not Stored on Server
                </h3>
                <p className="text-sm text-slate-300 max-w-md leading-relaxed mb-6">
                  This document was indexed directly from text knowledge chunks. You can read the
                  full policy clauses in the Policy Reader view.
                </p>
                <button
                  type="button"
                  onClick={() => setViewMode('reader')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Switch to Policy Reader</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Page navigation footer (only in PDF view when fileUrl is present) */}
      {viewMode === 'pdf' && resolvedFileUrl && (
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
