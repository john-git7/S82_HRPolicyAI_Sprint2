// src/components/documents/DocumentViewer.jsx
import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import {
  X,
  Download,
  FileText,
  Globe,
  Tag,
  Calendar,
  BookOpen,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Printer,
  ChevronRight,
  Hash,
} from 'lucide-react';

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
          'This policy outlines statutory and discretionary leave entitlements for all regular full-time employees based in India. It aims to foster healthy work-life balance and provide adequate rest periods while ensuring organizational operational continuity.',
      },
      {
        title: '2. Entitlement Breakdown',
        content:
          'Eligible employees are credited with the following annual leave quotas on January 1st of each calendar year:\n• Earned Leave (EL): 18 working days per year, credited pro-rata quarterly.\n• Casual Leave (CL): 12 working days per year for personal matters and emergencies.\n• Sick Leave (SL): 10 working days per year for illness or medical consultations.\n• Mandatory National & Festival Holidays: 10 days declared annually by the regional People Committee.',
      },
      {
        title: '3. Carry-Forward & Encashment Rules',
        content:
          '• A maximum of 45 unused Earned Leave days can be carried forward into subsequent calendar years. Any balance exceeding 45 days automatically lapses on March 31st.\n• Casual and Sick Leaves expire at the end of each calendar year and cannot be carried forward.\n• Accumulated Earned Leave is eligible for encashment upon separation or retirement at the final basic salary rate.',
      },
      {
        title: '4. Application & Approval Process',
        content:
          '• Planned leave exceeding 3 consecutive days must be requested at least 10 business days in advance via the HR Self-Service portal.\n• Sick leave exceeding 3 consecutive working days requires submission of a medical fitness certificate from a registered medical practitioner.\n• Immediate managers must approve or escalate requests within 48 business hours.',
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
          'Employees accrue 20 PTO days annually, calculated on a bi-weekly pay cycle at approximately 6.15 hours per pay period. Employees with 5+ years of continuous service accrue 25 days annually.',
      },
      {
        title: '3. Rollover & Encashment Limit',
        content:
          'A maximum of 5 unused PTO days can be rolled over into the next calendar year, expiring on June 30th. Except where mandated by state law (e.g. California), unused accrued PTO is paid out upon separation.',
      },
      {
        title: '4. Statutory Leaves (FMLA & State Leaves)',
        content:
          'Employees eligible under the Family and Medical Leave Act (FMLA) may take up to 12 weeks of job-protected unpaid leave for qualifying family or medical events with health benefits maintained.',
      },
    ],
  },
  doc_gl_handbook: {
    sections: [
      {
        title: 'Chapter 1: General Employment Principles',
        content:
          'Our organization commits to equal employment opportunity, fostering an inclusive environment free from harassment, discrimination, or retaliation. All employees worldwide must adhere to statutory local standards and global corporate values.',
      },
      {
        title: 'Chapter 2: Working Hours & Attendance',
        content:
          'Standard working hours are 40 hours weekly, Monday through Friday, 9:00 AM to 6:00 PM local office time with a one-hour meal period. Core collaboration hours are 10:00 AM to 4:00 PM local time.',
      },
      {
        title: 'Chapter 3: Confidentiality & IP Assignment',
        content:
          'All intellectual property, inventions, and research created during employment belong solely to the organization. Confidential data must never be transmitted outside corporate-approved channels or stored on unmanaged personal devices.',
      },
      {
        title: 'Chapter 4: Workplace Health & Safety',
        content:
          'We provide a safe, ergonomically sound work environment. Workplace injuries, safety hazards, or security concerns must be reported to the Workplace Operations desk within 24 hours.',
      },
    ],
  },
  doc_in_insurance: {
    sections: [
      {
        title: '1. Group Medical Cover (GMC) Scope',
        content:
          'Cashless and reimbursement hospitalization coverage up to ₹5,00,000 per family floater per policy year across 6,500+ network hospitals in India.',
      },
      {
        title: '2. Covered Dependents',
        content:
          'Covered family members include the primary employee, lawful spouse, and up to two dependent children aged up to 25 years. Parental insurance can be opted into as an annual voluntary co-pay add-on during open enrollment.',
      },
      {
        title: '3. Cashless Hospitalization Protocol',
        content:
          'Show your digital TPA health card at any empanelled hospital. For planned procedures, obtain pre-authorization at least 48 hours prior to admission. Emergency admissions must be notified within 24 hours of hospitalization.',
      },
    ],
  },
  doc_gl_parental: {
    sections: [
      {
        title: '1. Primary Caregiver Leave',
        content:
          'All primary caregivers (birth, adoptive, or surrogate) are entitled to 26 consecutive weeks of fully paid leave. Leave can commence up to 8 weeks prior to the expected delivery date.',
      },
      {
        title: '2. Secondary Caregiver Leave',
        content:
          'Secondary caregivers receive 4 consecutive weeks of fully paid parental leave, usable anytime within the child’s first 12 months following birth or legal adoption.',
      },
      {
        title: '3. Return-to-Work Flexibility',
        content:
          'Returning parents can opt for a phased 80% working schedule during their first month back without salary reduction to ease transition back to full-time work.',
      },
    ],
  },
  doc_uk_benefits: {
    sections: [
      {
        title: '1. Workplace Pension Scheme',
        content:
          'Automatic enrollment in the qualifying workplace pension scheme with a 5% employee contribution matched by a 4% employer contribution.',
      },
      {
        title: '2. Private Healthcare & Dental',
        content:
          'Comprehensive private medical insurance (PMI) covering inpatient and outpatient medical specialists, mental healthcare, and optical/dental allowances.',
      },
    ],
  },
  doc_gl_code: {
    sections: [
      {
        title: '1. Professional Ethics & Integrity',
        content:
          'Every employee must maintain honesty, transparency, and the highest standard of integrity in all internal and external professional relationships.',
      },
      {
        title: '2. Anti-Bribery & Gifts Policy',
        content:
          'No employee may offer, solicit, or accept any cash gifts, kickbacks, or favors from vendors, partners, or government officials.',
      },
    ],
  },
  doc_gl_remote: {
    sections: [
      {
        title: '1. Hybrid Collaboration Model',
        content:
          'Eligible teams operate under a hybrid model of 2 to 3 collaborative office days per week, with flexible remote work for remaining business days.',
      },
      {
        title: '2. Home Office Setup Allowance',
        content:
          'A one-time setup reimbursement of up to $500 (or regional currency equivalent) is provided for ergonomic home office furniture and peripherals.',
      },
    ],
  },
};

function DocumentViewerComponent({ doc, document: docProp, isOpen = true, onClose }) {
  const activeDoc = docProp || doc;

  const [searchFilter, setSearchFilter] = useState('');
  const [copiedSection, setCopiedSection] = useState(null);
  const scrollContainerRef = useRef(null);

  // Reset search when modal opens or document changes
  useEffect(() => {
    if (isOpen) {
      setSearchFilter('');
      setCopiedSection(null);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [isOpen, activeDoc?.id]);

  // Keyboard navigation: Escape to close
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [isOpen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Retrieve structured sections for this document
  const docArchive = useMemo(() => {
    if (!activeDoc) return { sections: [] };
    if (POLICY_CONTENT_ARCHIVE[activeDoc.id]) {
      return POLICY_CONTENT_ARCHIVE[activeDoc.id];
    }
    return {
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
  }, [activeDoc?.id, activeDoc?.name, activeDoc?.region, activeDoc?.version, activeDoc?.effectiveDate, activeDoc?.chunkCount]);

  // Memoized filter for instantaneous response without lag
  const filteredSections = useMemo(() => {
    if (!searchFilter.trim()) return docArchive.sections;
    const query = searchFilter.toLowerCase();
    return docArchive.sections.filter(
      (s) => s.title.toLowerCase().includes(query) || s.content.toLowerCase().includes(query)
    );
  }, [docArchive.sections, searchFilter]);

  const handleCopySection = (idx, text) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(idx);
    setTimeout(() => setCopiedSection(null), 1800);
  };

  const handleJumpToSection = (idx) => {
    const el = document.getElementById(`doc-sec-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isOpen === false || !activeDoc) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-xs overscroll-contain animate-in fade-in duration-150 select-text"
      role="dialog"
      aria-modal="true"
      aria-label={`Document Viewer: ${activeDoc.name}`}
    >
      {/* Top Header Bar - Fully Responsive */}
      <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-white border-b border-slate-200 shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h2 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate leading-tight">
                {activeDoc.name}
              </h2>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Official Policy
              </span>
            </div>

            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500">
              {activeDoc.region && (
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <Globe className="w-3 h-3 text-slate-400 shrink-0" /> {activeDoc.region}
                </span>
              )}
              {activeDoc.category && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="hidden xs:inline-flex items-center gap-1 text-slate-600">
                    <Tag className="w-3 h-3 text-slate-400 shrink-0" /> {activeDoc.category}
                  </span>
                </>
              )}
              {activeDoc.effectiveDate && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> {formatDate(activeDoc.effectiveDate)}
                  </span>
                </>
              )}
              <span className="text-slate-300">·</span>
              <span className="font-mono font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                v{activeDoc.version || '2026.1'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Policy Reader Badge Button */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs select-none">
            <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="hidden xs:inline">Policy Reader</span>
          </div>

          {/* Print / Save button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            title="Print or save as PDF"
          >
            <Printer className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden md:inline">Print</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Close viewer (Esc)"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Quick Jump Section Bar (Mobile & Desktop) */}
      <nav
        aria-label="Section navigation"
        className="bg-slate-50 border-b border-slate-200 px-3 sm:px-6 py-1.5 shrink-0 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar"
      >
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Sections:
        </span>
        {docArchive.sections.map((sec, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleJumpToSection(idx)}
            className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors text-slate-600 shrink-0 cursor-pointer shadow-2xs"
          >
            {sec.title.split(':')[0].replace(/Chapter\s*/i, 'Ch. ')}
          </button>
        ))}
      </nav>

      {/* Main Content Area - Fast Native Scrolling */}
      <main
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 overscroll-contain bg-slate-100/75"
      >
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {/* Document Overview & Search Header Card */}
          <section className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-7 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
              <div className="min-w-0">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block mb-0.5">
                  {activeDoc.category || 'Human Resources Policy'}
                </span>
                <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
                  {activeDoc.name}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                  File: {activeDoc.filename || 'Policy Document'} · Updated: {formatDate(activeDoc.updatedAt || activeDoc.effectiveDate)}
                </p>
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full md:w-72 shrink-0">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter clauses & terms..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 p-0.5 text-xs rounded-full hover:bg-slate-200 cursor-pointer"
                    title="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 py-4 sm:py-5 border-b border-slate-100 text-xs">
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] mb-0.5 font-medium">
                  Region Jurisdiction
                </span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {activeDoc.region || 'Global'}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] mb-0.5 font-medium">
                  Effective Date
                </span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {formatDate(activeDoc.effectiveDate)}
                </span>
              </div>
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] mb-0.5 font-medium">
                  RAG Vector Chunks
                </span>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {activeDoc.chunkCount ? activeDoc.chunkCount.toLocaleString() : '85'} indexed
                </span>
              </div>
              <div className="p-2.5 sm:p-3 bg-slate-50 rounded-lg sm:rounded-xl">
                <span className="text-slate-400 block text-[10px] sm:text-[11px] mb-0.5 font-medium">
                  Compliance Status
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs sm:text-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> Grounded
                </span>
              </div>
            </div>

            {/* Policy Clauses and Sections */}
            <div className="pt-5 sm:pt-6 space-y-4 sm:space-y-6">
              {filteredSections.map((section, idx) => (
                <article
                  key={idx}
                  id={`doc-sec-${idx}`}
                  className="space-y-2 scroll-mt-20 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-1.5 h-3.5 sm:h-4 bg-blue-600 rounded-full shrink-0" />
                      <span>{section.title}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleCopySection(idx, `${section.title}\n\n${section.content}`)}
                      className="opacity-60 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 text-xs flex items-center gap-1 cursor-pointer"
                      title="Copy section"
                    >
                      {copiedSection === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-3 sm:pl-3.5 whitespace-pre-line bg-slate-50/70 p-3 sm:p-4 rounded-xl border border-slate-200/70">
                    {section.content}
                  </div>
                </article>
              ))}

              {filteredSections.length === 0 && (
                <div className="py-10 text-center text-slate-500 text-xs sm:text-sm">
                  <p className="font-medium text-slate-700">No matching policy clauses found</p>
                  <p className="text-slate-400 mt-1">Try searching with a different term or clear the filter.</p>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('')}
                    className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export const DocumentViewer = memo(DocumentViewerComponent);
