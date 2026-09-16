// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  CheckCircle2,
  Layers,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { DocumentTable } from '../components/documents/DocumentTable';
import { UploadDocumentModal } from '../components/documents/UploadDocumentModal';
import { Loading } from '../components/common/Loading';
import { ErrorState } from '../components/common/ErrorState';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, docsRes] = await Promise.all([
        api.admin.getStats(),
        api.documents.getAll(),
      ]);
      setStats(statsRes);
      setDocuments(docsRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
      setError(err.message || 'Unable to retrieve admin metrics and document data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleUploadSuccess = async (formData) => {
    await api.documents.upload(formData);
    await loadDashboardData();
  };

  const handleDelete = async (docId) => {
    try {
      await api.documents.delete(docId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to delete document:', err);
      alert('Failed to delete document.');
    }
  };

  const handleReindex = async (docId) => {
    try {
      await api.documents.reindex(docId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to re-index document:', err);
      alert('Failed to reindex document.');
    }
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    filterRegion !== 'All' ||
    filterCategory !== 'All' ||
    filterStatus !== 'All';

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterRegion('All');
    setFilterCategory('All');
    setFilterStatus('All');
  };

  const filteredDocuments = useMemo(() => documents.filter((doc) => {
    const matchesSearch =
      !searchTerm.trim() ||
      doc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion =
      filterRegion === 'All' || doc.region?.toLowerCase() === filterRegion.toLowerCase();

    const matchesCategory =
      filterCategory === 'All' || doc.category?.toLowerCase() === filterCategory.toLowerCase();

    const matchesStatus =
      filterStatus === 'All' || doc.status?.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesRegion && matchesCategory && matchesStatus;
  }), [documents, searchTerm, filterRegion, filterCategory, filterStatus]);

  return (
    <PageContainer
      title="HR Admin Knowledge Base & RAG Index"
      subtitle="Monitor vectorized policy documents, chunk statistics, and extraction statuses"
    >
      <div className="space-y-6">
        {/* Top actions bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Knowledge Base Overview</h2>
            <p className="text-xs text-slate-500">
              Synchronized with ChromaDB vector store and FastAPI RAG service
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadDashboardData}
              title="Refresh dashboard metrics"
            >
              Sync
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsUploadOpen(true)}
            >
              Upload Document
            </Button>
          </div>
        </div>

        {error ? (
          <ErrorState
            title="Failed to load admin overview"
            message={error}
            onRetry={loadDashboardData}
          />
        ) : loading ? (
          <Loading message="Fetching knowledge base statistics..." className="py-16" />
        ) : (
          <>
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Documents */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Documents
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {stats?.documents || 0}
                  </span>
                  <span className="text-xs text-slate-400">PDF & DOCX</span>
                </div>
              </div>

              {/* Indexed Documents */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Indexed
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    {stats?.indexed || 0}
                  </span>
                  <span className="text-xs text-slate-400">active in ChromaDB</span>
                </div>
              </div>

              {/* Chunks */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Vector Chunks
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-indigo-600">
                    {stats?.chunks ? stats.chunks.toLocaleString() : '0'}
                  </span>
                  <span className="text-xs text-slate-400">embedded vectors</span>
                </div>
              </div>

              {/* Errors */}
              <div className="p-4 sm:p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Indexing Errors
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-2xl sm:text-3xl font-bold ${
                      stats?.errors > 0 ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {stats?.errors || 0}
                  </span>
                  <span className="text-xs text-slate-400">requiring attention</span>
                </div>
              </div>
            </div>

            {/* Document Knowledge Base Section */}
            <div className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-slate-900">
                  Document Knowledge Base
                </h3>
              </div>

              {/* Filter Bar */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, filename, or category..."
                    className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters:</span>
                  </div>

                  {/* Region Filter */}
                  <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Regions</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                    <option value="UK">UK</option>
                    <option value="Europe">Europe</option>
                    <option value="Singapore">Singapore</option>
                    <option value="APAC">APAC</option>
                    <option value="Global">Global</option>
                  </select>

                  {/* Category Filter */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Leave Policy">Leave Policy</option>
                    <option value="Handbook">Handbook</option>
                    <option value="Benefits">Benefits</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Expenses">Expenses</option>
                    <option value="Legal">Legal</option>
                    <option value="Contracts">Contracts</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Indexed">Indexed</option>
                    <option value="Processing">Processing</option>
                    <option value="Failed">Failed</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="flex items-center gap-1 text-slate-500 hover:text-rose-600 px-2 py-1 rounded hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <DocumentTable
                documents={filteredDocuments}
                onDelete={handleDelete}
                onReindex={handleReindex}
              />
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </PageContainer>
  );
}
