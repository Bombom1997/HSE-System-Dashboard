import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Search, 
  Plus, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar, 
  Eye, 
  ChevronRight, 
  UploadCloud, 
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditFinding, FindingStatus, FindingCategory, RiskLevel } from '../types';

export const FindingsPage: React.FC = () => {
  const { 
    currentUser, 
    findings, 
    createFinding, 
    submitCAR, 
    verifyAndCloseFinding, 
    exportFindingsToExcel 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Selected finding for detailed CAR workflow modal
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [showCARModal, setShowCARModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showNewFindingModal, setShowNewFindingModal] = useState(false);

  // CAR Form State (for PIC)
  const [carRCA, setCarRCA] = useState('');
  const [carMethod, setCarMethod] = useState('5-Why Analysis');
  const [carCorrection, setCarCorrection] = useState('');
  const [carActionPlan, setCarActionPlan] = useState('');
  const [carPreventive, setCarPreventive] = useState('');
  const [carEvidenceDesc, setCarEvidenceDesc] = useState('');

  // Verification Form State (for Lead Auditor)
  const [verifierNotes, setVerifierNotes] = useState('');
  const [effectiveness, setEffectiveness] = useState<'Efektif' | 'Tidak Efektif' | 'Perlu Tinjauan Ulang'>('Efektif');

  // New Finding Form State
  const [newFindingForm, setNewFindingForm] = useState({
    auditNumber: 'AUD-SMKP-2026-001',
    standardType: 'SMKP Minerba',
    clauseOrElement: 'Elemen IV.1 Pengelolaan Operasional',
    title: '',
    conditionDescription: '',
    criteriaRequirement: 'Kepdirjen Minerba No. 185.K/37.04/DJB/2019 Lampiran I Bagian IV',
    objectiveEvidence: '',
    category: 'Major Nonconformity' as FindingCategory,
    riskLevel: 'Tinggi' as RiskLevel,
    picName: 'Bambang Kusuma, S.T. (Mine Supt)',
    departmentName: 'Mining Operations & Engineering',
    dueDate: '2026-11-10'
  });

  // Filter findings
  const filteredFindings = findings.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (riskFilter !== 'all' && f.riskLevel !== riskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.findingNumber.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.clauseOrElement.toLowerCase().includes(q) ||
        f.picName.toLowerCase().includes(q);
    }
    return true;
  });

  const getCategoryBadge = (cat: FindingCategory) => {
    switch (cat) {
      case 'Major Nonconformity':
        return <span className="bg-red-50 text-red-700 border border-red-300 px-2 py-0.5 rounded-md text-[10px] font-bold">Major NC</span>;
      case 'Minor Nonconformity':
        return <span className="bg-amber-50 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold">Minor NC</span>;
      case 'Observation':
        return <span className="bg-blue-50 text-blue-800 border border-blue-300 px-2 py-0.5 rounded-md text-[10px] font-bold">Observasi</span>;
      case 'Opportunity for Improvement (OFI)':
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">OFI</span>;
    }
  };

  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'Closed':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-md text-[11px] font-bold">Closed (Ditutup)</span>;
      case 'Pending Verification':
        return <span className="bg-purple-50 text-purple-700 border border-purple-300 px-2.5 py-1 rounded-md text-[11px] font-bold">Menunggu Verifikasi</span>;
      case 'In Progress':
        return <span className="bg-blue-50 text-blue-700 border border-blue-300 px-2.5 py-1 rounded-md text-[11px] font-bold">Sedang Ditindaklanjuti</span>;
      case 'Open':
      case 'Assigned':
        return <span className="bg-red-50 text-red-700 border border-red-300 px-2.5 py-1 rounded-md text-[11px] font-bold">Open (Terbuka)</span>;
      case 'Overdue':
        return <span className="bg-rose-600 text-white px-2.5 py-1 rounded-md text-[11px] font-extrabold animate-pulse">Overdue!</span>;
      case 'Rejected':
        return <span className="bg-rose-50 text-rose-700 border border-rose-300 px-2.5 py-1 rounded-md text-[11px] font-bold">Ditolak</span>;
    }
  };

  const handleOpenCARModal = (f: AuditFinding) => {
    setSelectedFinding(f);
    setCarRCA(f.rootCauseAnalysis || '');
    setCarMethod(f.rcaMethod || '5-Why Analysis');
    setCarCorrection(f.immediateCorrection || '');
    setCarActionPlan(f.correctiveActionPlan || '');
    setCarPreventive(f.preventiveMeasure || '');
    setCarEvidenceDesc(f.evidenceDescription || '');
    setShowCARModal(true);
  };

  const handleOpenVerifyModal = (f: AuditFinding) => {
    setSelectedFinding(f);
    setVerifierNotes(f.verificationNotes || '');
    setEffectiveness(f.effectivenessResult || 'Efektif');
    setShowVerifyModal(true);
  };

  const handleCARSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;

    submitCAR(selectedFinding.id, {
      rca: carRCA,
      method: carMethod,
      correction: carCorrection,
      actionPlan: carActionPlan,
      preventive: carPreventive,
      evidenceDesc: carEvidenceDesc
    });

    setShowCARModal(false);
    setSelectedFinding(null);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFinding) return;

    verifyAndCloseFinding(selectedFinding.id, {
      verifierName: currentUser.fullName,
      notes: verifierNotes,
      effectiveness
    });

    setShowVerifyModal(false);
    setSelectedFinding(null);
  };

  const handleCreateFindingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFindingForm.title || !newFindingForm.conditionDescription) return;

    createFinding({
      auditId: 'audit-001',
      auditNumber: newFindingForm.auditNumber,
      standardType: newFindingForm.standardType,
      clauseOrElement: newFindingForm.clauseOrElement,
      title: newFindingForm.title,
      conditionDescription: newFindingForm.conditionDescription,
      criteriaRequirement: newFindingForm.criteriaRequirement,
      objectiveEvidence: newFindingForm.objectiveEvidence,
      category: newFindingForm.category,
      riskLevel: newFindingForm.riskLevel,
      status: 'Open',
      picId: 'user-op',
      picName: newFindingForm.picName,
      departmentName: newFindingForm.departmentName,
      dueDate: newFindingForm.dueDate,
      createdBy: currentUser.fullName
    });

    setShowNewFindingModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <AlertOctagon className="w-4 h-4" />
            <span>ALUR TINDAKAN KOREKTIF & PENCEGAHAN (CAPA)</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Pengelolaan Temuan Audit & Corrective Action
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pelacakan RCA (5-Why/Fishbone), mitigasi risiko, bukti perbaikan lapangan, dan verifikasi efektivitas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportFindingsToExcel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Ekspor Rekap Excel</span>
          </button>

          {currentUser.role !== 'VIEWER' && (
            <button
              onClick={() => setShowNewFindingModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Temuan Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor temuan, judul, PIC, klausul..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">Semua Status Temuan</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">Semua Kategori</option>
            <option value="Major Nonconformity">Major NC</option>
            <option value="Minor Nonconformity">Minor NC</option>
            <option value="Opportunity for Improvement (OFI)">OFI</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
          >
            <option value="all">Semua Tingkat Risiko</option>
            <option value="Tinggi">Risiko Tinggi</option>
            <option value="Sedang">Risiko Sedang</option>
            <option value="Rendah">Risiko Rendah</option>
          </select>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
            <h4 className="font-bold text-slate-700">Tidak ada temuan audit yang sesuai.</h4>
            <p className="text-xs text-slate-400 mt-1">Semua kriteria audit memenuhi standar atau filter tidak cocok.</p>
          </div>
        ) : (
          filteredFindings.map(finding => (
            <div key={finding.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-extrabold text-xs text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                    {finding.findingNumber}
                  </span>
                  {getCategoryBadge(finding.category)}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    finding.riskLevel === 'Tinggi' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    Risiko: {finding.riskLevel}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] font-medium text-slate-600">Audit: {finding.auditNumber}</span>
                </div>

                <div>{getStatusBadge(finding.status)}</div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{finding.title}</h3>
                  <div className="text-[11px] text-amber-700 font-semibold mt-1 font-mono">
                    Standar: {finding.standardType} • {finding.clauseOrElement}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div>
                    <span className="font-bold text-slate-800">Uraian Kondisi Lapangan: </span>
                    <span className="text-slate-700">{finding.conditionDescription}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Kriteria Acuan: </span>
                    <span className="text-slate-600">{finding.criteriaRequirement}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">Bukti Objektif: </span>
                    <span className="text-slate-600">{finding.objectiveEvidence}</span>
                  </div>
                </div>

                {/* CAR Implementation Progress */}
                {finding.rootCauseAnalysis && (
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/80 space-y-2 text-[11px]">
                    <div className="font-bold text-blue-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Tindakan Perbaikan (CAPA) yang Diserahkan PIC ({finding.rcaMethod}):</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Akar Masalah (RCA): </span>
                      <span className="text-slate-700">{finding.rootCauseAnalysis}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Tindakan Koreksi Langsung: </span>
                      <span className="text-slate-700">{finding.immediateCorrection}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-800">Rencana Korektif & Pencegahan: </span>
                      <span className="text-slate-700">{finding.correctiveActionPlan}</span>
                    </div>
                    {finding.evidenceDescription && (
                      <div className="p-2 bg-white rounded-lg border border-blue-200">
                        <span className="font-bold text-slate-800">Bukti Perbaikan: </span>
                        <span className="text-slate-600">{finding.evidenceDescription}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Verification result if verified */}
                {finding.verificationNotes && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] space-y-1">
                    <div className="font-bold text-emerald-950 flex items-center justify-between">
                      <span>Hasil Verifikasi Lead Auditor:</span>
                      <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">
                        {finding.effectivenessResult}
                      </span>
                    </div>
                    <p className="text-slate-700">{finding.verificationNotes}</p>
                    <div className="text-[10px] text-slate-400">Diverifikasi oleh: {finding.verifierName} pada {finding.closureDate || '-'}</div>
                  </div>
                )}

                {/* Footer PIC & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-500 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span>PIC: <strong className="text-slate-800">{finding.picName}</strong></span>
                    <span>•</span>
                    <span>Batas Waktu: <strong className="text-red-600">{finding.dueDate}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* PIC Action Button */}
                    {currentUser.role !== 'VIEWER' && finding.status !== 'Closed' && (
                      <button
                        onClick={() => handleOpenCARModal(finding)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                      >
                        {finding.rootCauseAnalysis ? 'Perbarui Rencana CAPA' : 'Isi Tindakan Korektif (CAPA)'}
                      </button>
                    )}

                    {/* Lead Auditor Verification Button */}
                    {currentUser.role === 'ADMIN' && finding.status === 'Pending Verification' && (
                      <button
                        onClick={() => handleOpenVerifyModal(finding)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-xs"
                      >
                        Verifikasi & Tutup Temuan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL 1: Submit Corrective Action (CAPA) */}
      {showCARModal && selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-400 font-bold">{selectedFinding.findingNumber}</span>
                <h3 className="font-bold text-base mt-0.5">Pengajuan Tindakan Korektif & Pencegahan (CAPA)</h3>
              </div>
              <button onClick={() => setShowCARModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCARSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Metodologi Analisis Akar Masalah (RCA) *</label>
                <select
                  value={carMethod}
                  onChange={e => setCarMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-semibold"
                >
                  <option value="5-Why Analysis">5-Why Analysis (5 Pertanyaan Mengapa)</option>
                  <option value="Fishbone Diagram (Ishikawa)">Diagram Tulang Ikan (Fishbone Ishikawa)</option>
                  <option value="ICAM (Incident Cause Analysis Method)">Metode ICAM Pertambangan</option>
                  <option value="SCAT (Systematic Cause Analysis Technique)">SCAT Technique</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Analisis Akar Masalah (Root Cause Analysis) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Uraikan faktor manusia, peralatan, metode, dan manajemen yang menjadi penyebab utama kegagalan..."
                  value={carRCA}
                  onChange={e => setCarRCA(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tindakan Koreksi Langsung (Correction) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Tindakan seketika untuk menghentikan bahaya dan mengamankan lokasi tambang..."
                  value={carCorrection}
                  onChange={e => setCarCorrection(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rencana Tindakan Korektif (Corrective Action Plan) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Langkah perbaikan sistem/SOP/sarana agar temuan serupa tidak terulang kembali..."
                  value={carActionPlan}
                  onChange={e => setCarActionPlan(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Langkah Pencegahan (Preventive Measure)</label>
                <textarea
                  rows={2}
                  placeholder="Inspeksi rutin, kalibrasi berkala, sosialisasi mandatori..."
                  value={carPreventive}
                  onChange={e => setCarPreventive(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bukti Penyelesaian (Foto / Berita Acara / Laporan)</label>
                <textarea
                  rows={2}
                  placeholder="Sebutkan berkas lampiran, nomor berita acara perbaikan, link foto kondisi selesai perbaikan..."
                  value={carEvidenceDesc}
                  onChange={e => setCarEvidenceDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowCARModal(false)} className="px-4 py-2 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg">
                  Kirim Tindakan Perbaikan ke Verifikator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Lead Auditor Verification & Closure */}
      {showVerifyModal && selectedFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Verifikasi & Penutupan Temuan (Lead Auditor)</h3>
              <button onClick={() => setShowVerifyModal(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleVerifySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evaluasi Efektivitas Tindakan Perbaikan *</label>
                <select
                  value={effectiveness}
                  onChange={e => setEffectiveness(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold"
                >
                  <option value="Efektif">Efektif (Temuan Ditutup Secara Resmi - CLOSED)</option>
                  <option value="Tidak Efektif">Tidak Efektif (Tindakan Ditolak & Perlu Perbaikan Ulang)</option>
                  <option value="Perlu Tinjauan Ulang">Perlu Tinjauan Ulang (Sampling Lanjutan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Hasil Verifikasi Lapangan *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tuliskan temuan verifikasi fisik di lapangan, wawancara mandor, dan pengujian keandalan mitigasi..."
                  value={verifierNotes}
                  onChange={e => setVerifierNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowVerifyModal(false)} className="px-4 py-2 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">
                  Konfirmasi Hasil Verifikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add New Finding */}
      {showNewFindingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Temuan Audit Manual</h3>
              <button onClick={() => setShowNewFindingModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateFindingSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Judul Ringkas Temuan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Barikade Jalan Hauling Tidak Memenuhi Tinggi 3/4 Roda HD"
                  value={newFindingForm.title}
                  onChange={e => setNewFindingForm({ ...newFindingForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Temuan</label>
                  <select
                    value={newFindingForm.category}
                    onChange={e => setNewFindingForm({ ...newFindingForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Major Nonconformity">Major Nonconformity</option>
                    <option value="Minor Nonconformity">Minor Nonconformity</option>
                    <option value="Observation">Observation</option>
                    <option value="Opportunity for Improvement (OFI)">OFI</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Risiko</label>
                  <select
                    value={newFindingForm.riskLevel}
                    onChange={e => setNewFindingForm({ ...newFindingForm, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Tinggi">Tinggi</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah">Rendah</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Kondisi Aktual *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Fakta lapangan..."
                  value={newFindingForm.conditionDescription}
                  onChange={e => setNewFindingForm({ ...newFindingForm, conditionDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bukti Objektif</label>
                <textarea
                  rows={2}
                  placeholder="Foto dokumentasi, saksi..."
                  value={newFindingForm.objectiveEvidence}
                  onChange={e => setNewFindingForm({ ...newFindingForm, objectiveEvidence: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIC Penanggung Jawab</label>
                  <input
                    type="text"
                    value={newFindingForm.picName}
                    onChange={e => setNewFindingForm({ ...newFindingForm, picName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Penyelesaian</label>
                  <input
                    type="date"
                    value={newFindingForm.dueDate}
                    onChange={e => setNewFindingForm({ ...newFindingForm, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowNewFindingModal(false)} className="px-4 py-2 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                  Terbitkan Temuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
