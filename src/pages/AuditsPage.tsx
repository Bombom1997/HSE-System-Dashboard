import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Calendar, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet, 
  User, 
  Building2, 
  MapPin, 
  Eye, 
  ArrowRight,
  FileCheck,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AuditItem, ChecklistResult, AuditType } from '../types';

interface AuditsPageProps {
  onNavigateToFinding?: (findingId?: string) => void;
}

export const AuditsPage: React.FC<AuditsPageProps> = ({ onNavigateToFinding }) => {
  const { 
    currentUser, 
    audits, 
    createAudit, 
    updateChecklistResult, 
    updateAuditStatus,
    createFinding,
    departments, 
    sites, 
    exportAuditReportToExcel 
  } = useApp();

  // Selected active audit
  const [activeAuditId, setActiveAuditId] = useState<string>(audits[0]?.id || '');
  const [filterChecklistStatus, setFilterChecklistStatus] = useState<string>('all');
  const [searchChecklist, setSearchChecklist] = useState<string>('');

  // Modals
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [verifyingChecklistId, setVerifyingChecklistId] = useState<string | null>(null);

  // Quick Finding creation modal
  const [quickFindingChecklist, setQuickFindingChecklist] = useState<any | null>(null);
  const [quickFindingCategory, setQuickFindingCategory] = useState<'Major Nonconformity' | 'Minor Nonconformity' | 'Observation'>('Major Nonconformity');
  const [quickFindingCondition, setQuickFindingCondition] = useState('');
  const [quickFindingEvidence, setQuickFindingEvidence] = useState('');

  // Checklist Verification Form State
  const [verifyStatus, setVerifyStatus] = useState<ChecklistResult>('Compliant');
  const [auditorNotes, setAuditorNotes] = useState('');
  const [fieldObs, setFieldObs] = useState('');
  const [naJustification, setNaJustification] = useState('');

  // New Audit Form State
  const [newAuditData, setNewAuditData] = useState({
    title: '',
    auditType: 'SMKP Minerba' as AuditType,
    departmentId: departments[0]?.id || '',
    siteId: sites[0]?.id || '',
    startDate: '2026-11-01',
    endDate: '2026-11-05',
    leadAuditor: currentUser.fullName,
    auditeePIC: 'Bambang Kusuma, S.T. (Mine Supt)',
    scope: 'Penerapan Elemen I s/d VII SMKP Minerba di area pit dan workshop',
    objective: 'Audit kepatuhan tahunan sesuai Kepdirjen Minerba No. 185.K/37.04/DJB/2019'
  });

  const selectedAudit = audits.find(a => a.id === activeAuditId) || audits[0];

  // Calculate audit statistics
  const totalCriteria = selectedAudit?.checklists.length || 0;
  const compliantCount = selectedAudit?.checklists.filter(c => c.resultStatus === 'Compliant').length || 0;
  const noncompliantCount = selectedAudit?.checklists.filter(c => c.resultStatus === 'Noncompliant').length || 0;
  const partialCount = selectedAudit?.checklists.filter(c => c.resultStatus === 'Partial Compliance').length || 0;
  const naCount = selectedAudit?.checklists.filter(c => c.resultStatus === 'Not Applicable').length || 0;
  const unverifiedCount = selectedAudit?.checklists.filter(c => c.resultStatus === 'Not Yet Verified').length || 0;

  const applicableCriteria = totalCriteria - naCount;
  // Official formula: Compliant divided by evaluated applicable
  const complianceScore = applicableCriteria > 0 
    ? Math.round(((compliantCount + (partialCount * 0.5)) / applicableCriteria) * 100) 
    : 0;

  // Filter checklists
  const filteredChecklists = selectedAudit?.checklists.filter(c => {
    if (filterChecklistStatus !== 'all' && c.resultStatus !== filterChecklistStatus) return false;
    if (searchChecklist.trim()) {
      const q = searchChecklist.toLowerCase();
      return c.code.toLowerCase().includes(q) || c.requirementText.toLowerCase().includes(q);
    }
    return true;
  }) || [];

  const handleCreateAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditData.title) return;

    const dept = departments.find(d => d.id === newAuditData.departmentId);
    const site = sites.find(s => s.id === newAuditData.siteId);

    const generatedNum = `AUD-${newAuditData.auditType.includes('SMKP') ? 'SMKP' : 'ISO'}-${new Date().getFullYear()}-${String(audits.length + 1).padStart(3, '0')}`;

    createAudit({
      auditNumber: generatedNum,
      title: newAuditData.title,
      auditType: newAuditData.auditType,
      standards: [newAuditData.auditType],
      departmentId: newAuditData.departmentId,
      departmentName: dept?.name || 'SHE',
      siteId: newAuditData.siteId,
      siteName: site?.name || 'Pit Sangatta',
      startDate: newAuditData.startDate,
      endDate: newAuditData.endDate,
      leadAuditor: newAuditData.leadAuditor,
      auditors: ['Ir. Hendra Wijaya, IPM', 'Agus Prasetyo, S.T.'],
      auditeePIC: newAuditData.auditeePIC,
      scope: newAuditData.scope,
      objective: newAuditData.objective,
      status: 'Terjadwal'
    });

    setShowNewAuditModal(false);
  };

  const handleOpenVerifyModal = (checklist: any) => {
    setVerifyingChecklistId(checklist.id);
    setVerifyStatus(checklist.resultStatus === 'Not Yet Verified' ? 'Compliant' : checklist.resultStatus);
    setAuditorNotes(checklist.auditorNotes || '');
    setFieldObs(checklist.fieldObservation || '');
    setNaJustification(checklist.naJustification || '');
  };

  const handleSaveChecklistVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudit || !verifyingChecklistId) return;

    if (verifyStatus === 'Not Applicable' && !naJustification.trim()) {
      alert('Sesuai prosedur audit, status "Not Applicable" WAJIB disertai alasan justifikasi teknis.');
      return;
    }

    updateChecklistResult(
      selectedAudit.id,
      verifyingChecklistId,
      verifyStatus,
      auditorNotes,
      fieldObs,
      naJustification
    );

    setVerifyingChecklistId(null);
  };

  const handleCreateFindingFromChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudit || !quickFindingChecklist) return;

    createFinding({
      auditId: selectedAudit.id,
      auditNumber: selectedAudit.auditNumber,
      standardType: quickFindingChecklist.standardType,
      clauseOrElement: quickFindingChecklist.code,
      title: `Ketidaksesuaian Kriteria ${quickFindingChecklist.code}: ${quickFindingChecklist.requirementText.substring(0, 50)}...`,
      conditionDescription: quickFindingCondition || quickFindingChecklist.fieldObservation || 'Kondisi aktual tidak memenuhi standar.',
      criteriaRequirement: quickFindingChecklist.requirementText,
      objectiveEvidence: quickFindingEvidence || quickFindingChecklist.auditorNotes || 'Bukti sampling audit di lapangan.',
      category: quickFindingCategory,
      riskLevel: quickFindingCategory === 'Major Nonconformity' ? 'Tinggi' : 'Sedang',
      status: 'Open',
      picId: 'user-op',
      picName: selectedAudit.auditeePIC,
      departmentName: selectedAudit.departmentName,
      dueDate: '2026-11-15',
      createdBy: currentUser.fullName
    });

    setQuickFindingChecklist(null);
    setQuickFindingCondition('');
    setQuickFindingEvidence('');
    alert('Temuan audit berhasil diterbitkan dan masuk ke modul Tindakan Perbaikan (CAR)!');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <ClipboardCheck className="w-4 h-4" />
            <span>MODUL AUDIT & COMPLIANCE TERINTEGRASI</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Program, Jadwal & Pelaksanaan Audit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Checklist digital SMKP Minerba & ISO, verifikasi bukti objektif, dan perhitungan capaian otomatis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={() => setShowNewAuditModal(true)}
              className="px-3.5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Audit Baru</span>
            </button>
          )}

          {selectedAudit && (
            <button
              onClick={() => exportAuditReportToExcel(selectedAudit.id)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Checklist Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Program Audit Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {audits.map(audit => {
          const isSelected = activeAuditId === audit.id;
          return (
            <div
              key={audit.id}
              onClick={() => setActiveAuditId(audit.id)}
              className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-mono font-bold ${isSelected ? 'text-amber-400' : 'text-amber-600'}`}>
                  {audit.auditNumber}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  audit.status === 'Sedang Berjalan' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                }`}>
                  {audit.status}
                </span>
              </div>
              <h3 className="font-bold text-sm leading-tight">{audit.title}</h3>
              <p className={`text-xs mt-1 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {audit.scope}
              </p>
              <div className={`mt-3 pt-3 border-t text-[11px] flex items-center justify-between ${
                isSelected ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <span>PIC: {audit.auditeePIC.split(' ')[0]}</span>
                <span>{audit.startDate} s/d {audit.endDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Audit Detail & Live Calculation Dashboard */}
      {selectedAudit && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-500">{selectedAudit.auditNumber}</span>
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {selectedAudit.auditType}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{selectedAudit.title}</h3>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                <span>Lead Auditor: <strong>{selectedAudit.leadAuditor}</strong></span>
                <span>•</span>
                <span>Auditee: <strong>{selectedAudit.auditeePIC}</strong></span>
                <span>•</span>
                <span>Site: <strong>{selectedAudit.siteName}</strong></span>
              </div>
            </div>

            {/* Live Compliance Rate Gauge */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center gap-4 shrink-0 shadow-xs">
              <div className="text-right">
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Capaian Kepatuhan</div>
                <div className="text-2xl font-extrabold text-white">{complianceScore}%</div>
                <div className="text-[10px] text-slate-400">Metodologi Kriteria Terverifikasi</div>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-amber-500 flex items-center justify-center font-bold text-xs text-amber-400">
                {complianceScore}%
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px]">Total Kriteria</div>
              <div className="text-base font-bold text-slate-900 mt-0.5">{totalCriteria}</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-800 text-[11px] font-semibold">Compliant</div>
              <div className="text-base font-bold text-emerald-700 mt-0.5">{compliantCount}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <div className="text-red-800 text-[11px] font-semibold">Noncompliant</div>
              <div className="text-base font-bold text-red-700 mt-0.5">{noncompliantCount}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-amber-800 text-[11px] font-semibold">Partial</div>
              <div className="text-base font-bold text-amber-700 mt-0.5">{partialCount}</div>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
              <div className="text-slate-600 text-[11px]">Belum Diperiksa</div>
              <div className="text-base font-bold text-slate-700 mt-0.5">{unverifiedCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Search & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nomor kriteria atau bunyi persyaratan audit..."
            value={searchChecklist}
            onChange={e => setSearchChecklist(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Hasil:</span>
          <select
            value={filterChecklistStatus}
            onChange={e => setFilterChecklistStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 font-medium"
          >
            <option value="all">Semua Status</option>
            <option value="Compliant">Compliant</option>
            <option value="Noncompliant">Noncompliant</option>
            <option value="Partial Compliance">Partial Compliance</option>
            <option value="Not Applicable">Not Applicable</option>
            <option value="Not Yet Verified">Not Yet Verified</option>
          </select>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4 w-28">Kriteria</th>
                <th className="py-3 px-4">Persyaratan Audit & Bukti Yang Diharapkan</th>
                <th className="py-3 px-4">Hasil & Catatan Auditor</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 text-right w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredChecklists.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 align-top">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.code}
                    </span>
                    <div className="text-[10px] text-amber-700 font-semibold mt-1">{item.standardType}</div>
                  </td>
                  <td className="py-3 px-4 align-top max-w-md">
                    <p className="font-semibold text-slate-800 leading-relaxed">{item.requirementText}</p>
                    <div className="text-[11px] text-slate-500 mt-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-700">Bukti: </span>{item.expectedEvidence}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top max-w-sm">
                    {item.auditorNotes ? (
                      <div className="space-y-1">
                        <div className="text-slate-800 font-medium">{item.auditorNotes}</div>
                        {item.fieldObservation && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-md">
                            <strong>Observasi:</strong> {item.fieldObservation}
                          </div>
                        )}
                        {item.naJustification && (
                          <div className="text-[11px] text-slate-600 bg-slate-100 p-1.5 rounded-md">
                            <strong>Justifikasi N/A:</strong> {item.naJustification}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">Verifikator: {item.verifiedBy}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Belum ada catatan auditor</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border inline-block ${
                      item.resultStatus === 'Compliant' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                      item.resultStatus === 'Noncompliant' ? 'bg-red-50 text-red-800 border-red-300' :
                      item.resultStatus === 'Partial Compliance' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                      item.resultStatus === 'Not Applicable' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {item.resultStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 align-top text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {currentUser.role !== 'VIEWER' && (
                        <button
                          onClick={() => handleOpenVerifyModal(item)}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Verifikasi
                        </button>
                      )}

                      {/* Convert to Finding Button if Noncompliant or Partial */}
                      {(item.resultStatus === 'Noncompliant' || item.resultStatus === 'Partial Compliance') && (
                        <button
                          onClick={() => {
                            setQuickFindingChecklist(item);
                            setQuickFindingCondition(item.fieldObservation || item.auditorNotes || '');
                            setQuickFindingEvidence(item.expectedEvidence || '');
                          }}
                          className="px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded text-[10px] font-bold transition flex items-center gap-1"
                          title="Terbitkan Temuan Audit Resmi"
                        >
                          <AlertOctagon className="w-3 h-3" />
                          <span>Buat Temuan</span>
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

      {/* MODAL 1: Checklist Verification */}
      {verifyingChecklistId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Verifikasi Hasil Pemeriksaan Audit</h3>
              <button onClick={() => setVerifyingChecklistId(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveChecklistVerification} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Hasil Pemeriksaan *</label>
                <select
                  value={verifyStatus}
                  onChange={e => setVerifyStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold"
                >
                  <option value="Compliant">Compliant (Sesuai Persyaratan Penuh)</option>
                  <option value="Partial Compliance">Partial Compliance (Kepatuhan Sebagian)</option>
                  <option value="Noncompliant">Noncompliant (Tidak Sesuai / Temuan)</option>
                  <option value="Not Applicable">Not Applicable (Tidak Relevan dengan Alasan)</option>
                  <option value="Not Yet Verified">Not Yet Verified (Belum Diverifikasi)</option>
                </select>
              </div>

              {verifyStatus === 'Not Applicable' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <label className="block font-bold text-amber-900">Alasan & Justifikasi Not Applicable (Wajib) *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Contoh: Site ini tidak memiliki fasilitas peledakan karena seluruh penggalian bersifat free-digging..."
                    value={naJustification}
                    onChange={e => setNaJustification(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Auditor & Hasil Wawancara</label>
                <textarea
                  rows={2}
                  placeholder="Catatan klarifikasi dokumen, nomor dokumen yang diverifikasi..."
                  value={auditorNotes}
                  onChange={e => setAuditorNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hasil Observasi Lapangan / Sampling Fisik</label>
                <textarea
                  rows={2}
                  placeholder="Kondisi riil di pit/workshop, nomor unit, temuan visual..."
                  value={fieldObs}
                  onChange={e => setFieldObs(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setVerifyingChecklistId(null)} className="px-3 py-1.5 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg">
                  Simpan Hasil Pemeriksaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Finding Directly From Noncompliant Checklist */}
      {quickFindingChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-red-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-300" />
                <h3 className="font-bold text-base">Terbitkan Temuan Audit Resmi (CAR)</h3>
              </div>
              <button onClick={() => setQuickFindingChecklist(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateFindingFromChecklist} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Klasifikasi Kategori Temuan *</label>
                <select
                  value={quickFindingCategory}
                  onChange={e => setQuickFindingCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-bold"
                >
                  <option value="Major Nonconformity">Major Nonconformity (Ketidaksesuaian Mayor - Kritis)</option>
                  <option value="Minor Nonconformity">Minor Nonconformity (Ketidaksesuaian Minor)</option>
                  <option value="Observation">Observation (Observasi Lapangan)</option>
                  <option value="Opportunity for Improvement (OFI)">Opportunity for Improvement (Peluang Peningkatan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Uraian Kondisi Aktual di Lapangan *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Deskripsikan fakta objektif penyimpangan yang ditemukan auditor..."
                  value={quickFindingCondition}
                  onChange={e => setQuickFindingCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bukti Objektif (Foto / Dokumen / Sampling) *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Foto dokumentasi, saksi, log book, hasil ukur..."
                  value={quickFindingEvidence}
                  onChange={e => setQuickFindingEvidence(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setQuickFindingChecklist(null)} className="px-3 py-1.5 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg">
                  Terbitkan Temuan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Schedule New Audit Program */}
      {showNewAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Jadwalkan Program Audit Baru</h3>
              <button onClick={() => setShowNewAuditModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAuditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama / Judul Audit *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Audit SMKP Minerba Semester II Area Coal Processing"
                  value={newAuditData.title}
                  onChange={e => setNewAuditData({ ...newAuditData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Standar Audit</label>
                  <select
                    value={newAuditData.auditType}
                    onChange={e => setNewAuditData({ ...newAuditData, auditType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="SMKP Minerba">SMKP Minerba Kepdirjen 185</option>
                    <option value="Audit Terintegrasi">Audit Terintegrasi (SMKP + ISO)</option>
                    <option value="ISO 9001">ISO 9001:2015 (Mutu)</option>
                    <option value="ISO 14001">ISO 14001:2015 (Lingkungan)</option>
                    <option value="ISO 45001">ISO 45001:2018 (K3)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen Sasaran</label>
                  <select
                    value={newAuditData.departmentId}
                    onChange={e => setNewAuditData({ ...newAuditData, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Pelaksanaan</label>
                  <input
                    type="date"
                    value={newAuditData.startDate}
                    onChange={e => setNewAuditData({ ...newAuditData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={newAuditData.endDate}
                    onChange={e => setNewAuditData({ ...newAuditData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Auditor Bersertifikat</label>
                  <input
                    type="text"
                    value={newAuditData.leadAuditor}
                    onChange={e => setNewAuditData({ ...newAuditData, leadAuditor: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Auditee / PIC Departemen</label>
                  <input
                    type="text"
                    value={newAuditData.auditeePIC}
                    onChange={e => setNewAuditData({ ...newAuditData, auditeePIC: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ruang Lingkup (Scope)</label>
                <textarea
                  rows={2}
                  value={newAuditData.scope}
                  onChange={e => setNewAuditData({ ...newAuditData, scope: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowNewAuditModal(false)} className="px-4 py-2 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg">
                  Buat Jadwal & Generate Checklist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
