import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileSpreadsheet,
  Building2,
  MapPin,
  Calendar,
  Lock,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DocumentItem, DocumentCategoryType, DocumentStatus, ConfidentialityLevel } from '../types';

export const DocumentsPage: React.FC = () => {
  const { 
    currentUser, 
    documents, 
    addDocument, 
    updateDocument, 
    deleteDocument, 
    submitDocumentForReview, 
    approveDocument, 
    rejectDocument,
    createDocumentRevision,
    archiveDocument,
    departments, 
    sites,
    smkpMaster,
    isoMaster,
    exportDocumentsToExcel,
    selectedSiteFilter,
    selectedDeptFilter
  } = useApp();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deptFilter, setDeptFilter] = useState<string>(selectedDeptFilter);
  const [siteFilter, setSiteFilter] = useState<string>(selectedSiteFilter);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentItem | null>(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // New Revision Form State
  const [newRevNumber, setNewRevNumber] = useState('Rev.01');
  const [revChangeSummary, setRevChangeSummary] = useState('');

  // New Document Form State
  const [formData, setFormData] = useState({
    docNumber: '',
    title: '',
    category: 'SOP' as DocumentCategoryType,
    departmentId: departments[0]?.id || '',
    siteId: sites[0]?.id || '',
    businessProcess: '',
    sheAspectRisk: '',
    currentRevision: 'Rev.00',
    confidentiality: 'Internal' as ConfidentialityLevel,
    reviewDueDate: '2027-12-31',
    fileName: '',
    changeSummary: 'Penerbitan baru prosedur operasional',
    mappedSMKPElements: [] as string[],
    mappedISOClauses: [] as string[]
  });

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    // RBAC: Viewer only sees Effective or Approved documents
    if (currentUser.role === 'VIEWER') {
      if (doc.status !== 'Effective' && doc.status !== 'Approved') return false;
    }

    // Category Tab Filter
    if (selectedCategoryTab === 'EXPIRED') {
      const dueDate = new Date(doc.reviewDueDate).getTime();
      const now = new Date('2026-10-17').getTime();
      if (dueDate > now) return false;
    } else if (selectedCategoryTab === 'IN_REVIEW') {
      if (doc.status !== 'Submitted' && doc.status !== 'Under Review') return false;
    } else if (selectedCategoryTab === 'PENDING_APPROVAL') {
      if (doc.status !== 'Pending Approval' && doc.status !== 'Submitted') return false;
    } else if (selectedCategoryTab === 'ARCHIVED') {
      if (doc.status !== 'Archived' && doc.status !== 'Obsolete') return false;
    } else if (selectedCategoryTab !== 'ALL' && doc.category !== selectedCategoryTab) {
      return false;
    }

    // Status Filter dropdown
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false;

    // Site & Dept Filter
    if (siteFilter !== 'all' && doc.siteId !== siteFilter) return false;
    if (deptFilter !== 'all' && doc.departmentId !== deptFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDocNum = doc.docNumber.toLowerCase().includes(q);
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchProcess = doc.businessProcess.toLowerCase().includes(q);
      const matchRisk = doc.sheAspectRisk.toLowerCase().includes(q);
      if (!matchDocNum && !matchTitle && !matchProcess && !matchRisk) return false;
    }

    return true;
  });

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Effective':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px] font-bold">Effective (Berlaku)</span>;
      case 'Approved':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-[11px] font-bold">Approved</span>;
      case 'Submitted':
      case 'Under Review':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-bold">Dalam Review</span>;
      case 'Revision Required':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-md text-[11px] font-bold">Perlu Revisi</span>;
      case 'Draft':
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">Draft</span>;
      case 'Obsolete':
      case 'Archived':
        return <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-medium line-through">Obsolete</span>;
    }
  };

  const handleCreateDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.docNumber || !formData.title) return;

    const dept = departments.find(d => d.id === formData.departmentId);
    const site = sites.find(s => s.id === formData.siteId);

    addDocument({
      docNumber: formData.docNumber,
      title: formData.title,
      category: formData.category,
      departmentId: formData.departmentId,
      departmentName: dept?.name || 'SHE',
      siteId: formData.siteId,
      siteName: site?.name || 'Pit Sangatta',
      businessProcess: formData.businessProcess,
      sheAspectRisk: formData.sheAspectRisk,
      currentRevision: formData.currentRevision,
      status: currentUser.role === 'ADMIN' ? 'Effective' : 'Submitted',
      confidentiality: formData.confidentiality,
      effectiveDate: new Date().toISOString().split('T')[0],
      reviewDueDate: formData.reviewDueDate,
      createdBy: currentUser.id,
      authorName: currentUser.fullName,
      reviewerName: 'Ir. Hendra Wijaya, IPM (Lead SHE)',
      approverName: currentUser.role === 'ADMIN' ? currentUser.fullName : 'Pending Approval KTT',
      fileName: formData.fileName || `${formData.docNumber}.pdf`,
      fileSizeKb: 1420,
      changeSummary: formData.changeSummary,
      mappedSMKPElements: formData.mappedSMKPElements,
      mappedISOClauses: formData.mappedISOClauses
    });

    setShowAddModal(false);
    // Reset Form
    setFormData({
      docNumber: '',
      title: '',
      category: 'SOP',
      departmentId: departments[0]?.id || '',
      siteId: sites[0]?.id || '',
      businessProcess: '',
      sheAspectRisk: '',
      currentRevision: 'Rev.00',
      confidentiality: 'Internal',
      reviewDueDate: '2027-12-31',
      fileName: '',
      changeSummary: 'Penerbitan baru prosedur operasional',
      mappedSMKPElements: [],
      mappedISOClauses: []
    });
  };

  const handleRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocDetails || !newRevNumber) return;

    createDocumentRevision(
      selectedDocDetails.id, 
      newRevNumber, 
      revChangeSummary || 'Pembaruan prosedur teknis', 
      `${selectedDocDetails.docNumber}_${newRevNumber}.pdf`
    );

    setShowRevisionModal(false);
    // Update local modal view
    const updated = documents.find(d => d.id === selectedDocDetails.id);
    if (updated) setSelectedDocDetails(updated);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocDetails || !rejectReason) return;
    rejectDocument(selectedDocDetails.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    const updated = documents.find(d => d.id === selectedDocDetails.id);
    if (updated) setSelectedDocDetails(updated);
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900">Database Dokumen & Standar Operasional Prosedur</h2>
          <p className="text-xs text-slate-500">
            Pengendalian siklus hidup SOP, Standar Parameter, Instruksi Kerja, dan JSA terverifikasi
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportDocumentsToExcel}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            title="Ekspor Seluruh Daftar Dokumen ke Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          {currentUser.role !== 'VIEWER' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{currentUser.role === 'ADMIN' ? 'Tambah Dokumen Baru' : 'Ajukan Dokumen Baru'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs (14 Sub-categories support) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        {[
          { id: 'ALL', label: 'Semua Dokumen' },
          { id: 'SOP', label: 'SOP' },
          { id: 'STD', label: 'Standar Parameter' },
          { id: 'IK', label: 'Instruksi Kerja (IK)' },
          { id: 'JSA', label: 'JSA / JHA' },
          { id: 'FORM', label: 'Formulir' },
          { id: 'REC', label: 'Rekaman' },
          { id: 'POL', label: 'Kebijakan Direksi' },
          { id: 'PED', label: 'Pedoman & Manual' },
          { id: 'REG', label: 'Regulasi Minerba' },
          { id: 'IN_REVIEW', label: 'Dalam Review' },
          { id: 'EXPIRED', label: 'Jatuh Tempo Review' },
          { id: 'ARCHIVED', label: 'Arsip / Obsolete' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategoryTab(tab.id)}
            className={`px-3 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
              selectedCategoryTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor dokumen, judul, proses bisnis, risiko..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          >
            <option value="all">Semua Status Dokumen</option>
            <option value="Effective">Effective (Berlaku)</option>
            <option value="Submitted">Submitted (Diajukan)</option>
            <option value="Under Review">Under Review</option>
            <option value="Revision Required">Revision Required</option>
            <option value="Obsolete">Obsolete</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          >
            <option value="all">Semua Dept</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.code}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={siteFilter}
            onChange={e => setSiteFilter(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none"
          >
            <option value="all">Semua Site</option>
            {sites.map(s => (
              <option key={s.id} value={s.id}>{s.name.split(' ')[1] || s.code}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700 tracking-wider">
              <tr>
                <th className="py-3 px-4">No. Dokumen & Kategori</th>
                <th className="py-3 px-4">Judul Dokumen</th>
                <th className="py-3 px-4">Departemen / Site</th>
                <th className="py-3 px-4">Revisi & Status</th>
                <th className="py-3 px-4">Jatuh Tempo Review</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada dokumen yang sesuai kriteria pencarian.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Coba ubah kata kunci atau filter tab kategori di atas.</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{doc.docNumber}</div>
                      <div className="text-[11px] font-semibold text-amber-700 mt-0.5">{doc.category}</div>
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <div className="font-semibold text-slate-800 line-clamp-1">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{doc.businessProcess}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-800 font-medium">{doc.departmentName.split(' ')[0]}</div>
                      <div className="text-[11px] text-slate-500">{doc.siteName.split(' ')[1] || doc.siteName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-700">{doc.currentRevision}</span>
                        {getStatusBadge(doc.status)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-700 font-medium">{doc.reviewDueDate}</div>
                      <div className="text-[10px] text-slate-400">Penyusun: {doc.authorName.split(' ')[0]}</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDocDetails(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Lihat Detail & Riwayat Revisi"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* File Download Simulation */}
                        <button
                          onClick={() => {
                            alert(`Mengunduh salinan resmi terkendali:\n${doc.fileName} (${doc.fileSizeKb} KB)\nStatus: ${doc.status}`);
                          }}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                          title="Unduh Salinan Dokumen Terkendali"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {currentUser.role === 'ADMIN' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Hapus dokumen ${doc.docNumber} secara permanen?`)) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Dokumen (Admin Only)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Detail Dokumen & Riwayat Revisi */}
      {selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                  {selectedDocDetails.docNumber} • {selectedDocDetails.currentRevision}
                </span>
                <h3 className="font-bold text-base leading-tight mt-0.5">{selectedDocDetails.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedDocDetails(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Status and Action Ribbon */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Status Siklus Hidup:</span>
                  {getStatusBadge(selectedDocDetails.status)}
                  <span className="text-slate-400">•</span>
                  <span className="font-semibold text-slate-700">Kerahasiaan:</span>
                  <span className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-medium">
                    {selectedDocDetails.confidentiality}
                  </span>
                </div>

                {/* Workflow Buttons */}
                <div className="flex items-center gap-2">
                  {currentUser.role === 'ADMIN' && (selectedDocDetails.status === 'Submitted' || selectedDocDetails.status === 'Under Review') && (
                    <>
                      <button
                        onClick={() => {
                          approveDocument(selectedDocDetails.id, currentUser.fullName);
                          const upd = documents.find(d => d.id === selectedDocDetails.id);
                          if (upd) setSelectedDocDetails(upd);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Setujui (Approve)</span>
                      </button>
                      <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Minta Revisi</span>
                      </button>
                    </>
                  )}

                  {currentUser.role !== 'VIEWER' && selectedDocDetails.status === 'Draft' && (
                    <button
                      onClick={() => {
                        submitDocumentForReview(selectedDocDetails.id);
                        const upd = documents.find(d => d.id === selectedDocDetails.id);
                        if (upd) setSelectedDocDetails(upd);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Ajukan Review</span>
                    </button>
                  )}

                  {currentUser.role !== 'VIEWER' && selectedDocDetails.status === 'Effective' && (
                    <button
                      onClick={() => {
                        setNewRevNumber(`Rev.0${selectedDocDetails.versions.length}`);
                        setShowRevisionModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition flex items-center gap-1 shadow-xs"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Buat Revisi Baru</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Departemen Pemilik</span>
                  <span className="font-semibold text-slate-800">{selectedDocDetails.departmentName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Site Operasional Tambang</span>
                  <span className="font-semibold text-slate-800">{selectedDocDetails.siteName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Tanggal Efektif Berlaku</span>
                  <span className="font-semibold text-slate-800">{selectedDocDetails.effectiveDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Jatuh Tempo Peninjauan</span>
                  <span className="font-semibold text-amber-700 font-medium">{selectedDocDetails.reviewDueDate}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Disusun Oleh</span>
                  <span className="font-semibold text-slate-800">{selectedDocDetails.authorName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium block">Disetujui Oleh</span>
                  <span className="font-semibold text-slate-800">{selectedDocDetails.approverName}</span>
                </div>
              </div>

              {/* Process & Risk */}
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-1">
                    Proses Bisnis Terkait:
                  </span>
                  <p className="text-slate-800">{selectedDocDetails.businessProcess}</p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block mb-1">
                    Aspek & Risiko SHE Yang Dikendalikan:
                  </span>
                  <p className="text-amber-900">{selectedDocDetails.sheAspectRisk}</p>
                </div>
              </div>

              {/* Multi-standard mappings */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Pemetaan Persyaratan Sistem Manajemen:</span>
                <div className="flex flex-wrap gap-2">
                  {selectedDocDetails.mappedSMKPElements.map((smkp, idx) => (
                    <span key={idx} className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-1 rounded-md text-[11px] font-semibold">
                      SMKP Minerba: Elemen {smkp}
                    </span>
                  ))}
                  {selectedDocDetails.mappedISOClauses.map((iso, idx) => (
                    <span key={idx} className="bg-indigo-100 text-indigo-900 border border-indigo-300 px-2 py-1 rounded-md text-[11px] font-semibold">
                      ISO: {iso}
                    </span>
                  ))}
                </div>
              </div>

              {/* Version History Table */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Riwayat Revisi Dokumen (Version Control):</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-semibold">
                      <tr>
                        <th className="p-2.5">Revisi</th>
                        <th className="p-2.5">Tanggal</th>
                        <th className="p-2.5">Ringkasan Perubahan</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5 text-right">Berkas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {selectedDocDetails.versions.map(ver => (
                        <tr key={ver.id} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-900">{ver.versionNumber}</td>
                          <td className="p-2.5 text-slate-600">{ver.releaseDate}</td>
                          <td className="p-2.5 text-slate-700">{ver.changeSummary}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              ver.status === 'Effective' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {ver.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => alert(`Mengunduh arsip versi ${ver.versionNumber}: ${ver.fileName}`)}
                              className="text-blue-600 hover:underline flex items-center justify-end gap-1 font-medium"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{ver.fileSizeKb} KB</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDocDetails(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create New Document */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah / Ajukan Dokumen Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocumentSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Dokumen Standar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SOP-MINE-025"
                    value={formData.docNumber}
                    onChange={e => setFormData({ ...formData, docNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Dokumen *</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="SOP">SOP - Standar Operasional Prosedur</option>
                    <option value="STD">STD - Standar Parameter</option>
                    <option value="IK">IK - Instruksi Kerja</option>
                    <option value="JSA">JSA - Job Safety Analysis</option>
                    <option value="FORM">FORM - Formulir Standar</option>
                    <option value="REC">REC - Rekaman</option>
                    <option value="POL">POL - Kebijakan Direksi</option>
                    <option value="PED">PED - Pedoman & Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Dokumen Resmi *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Prosedur Pengoperasian Unit Dump Truck di Musim Hujan"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen Pemilik</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site / Area Tambang</label>
                  <select
                    value={formData.siteId}
                    onChange={e => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proses Bisnis</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengangkutan batubara dari pit ke run of mine (ROM)"
                  value={formData.businessProcess}
                  onChange={e => setFormData({ ...formData, businessProcess: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Aspek dan Risiko SHE Terkait</label>
                <input
                  type="text"
                  placeholder="Contoh: Tabrakan alat berat, unit tergelincir, amblas"
                  value={formData.sheAspectRisk}
                  onChange={e => setFormData({ ...formData, sheAspectRisk: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kerahasiaan Dokumen</label>
                  <select
                    value={formData.confidentiality}
                    onChange={e => setFormData({ ...formData, confidentiality: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    <option value="Internal">Internal (Hanya Karyawan)</option>
                    <option value="Publik">Publik</option>
                    <option value="Rahasia (Confidential)">Rahasia (Confidential)</option>
                    <option value="Sangat Rahasia (Restricted)">Sangat Rahasia (Restricted)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Review Berkala</label>
                  <input
                    type="date"
                    value={formData.reviewDueDate}
                    onChange={e => setFormData({ ...formData, reviewDueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Perubahan / Alasan Pengajuan</label>
                <textarea
                  rows={2}
                  value={formData.changeSummary}
                  onChange={e => setFormData({ ...formData, changeSummary: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-xs"
                >
                  Simpan & Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: New Revision */}
      {showRevisionModal && selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Terbitkan Revisi Dokumen</h3>
              <button onClick={() => setShowRevisionModal(false)} className="text-slate-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRevisionSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Revisi Baru *</label>
                <input
                  type="text"
                  required
                  value={newRevNumber}
                  onChange={e => setNewRevNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Ringkasan Perubahan *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Jelaskan pasal atau instruksi yang diubah serta latar belakangnya..."
                  value={revChangeSummary}
                  onChange={e => setRevChangeSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowRevisionModal(false)} className="px-3 py-1.5 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                  Simpan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Reject / Revision Required Reason */}
      {showRejectModal && selectedDocDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-red-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Kembalikan Dokumen untuk Revisi</h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-200 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alasan Penolakan & Catatan Perbaikan *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan klausul atau bagian SOP yang belum memenuhi kriteria keselamatan tambang..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                  Kirim Catatan Revisi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
