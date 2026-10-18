import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Calendar,
  Award,
  HardHat,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ReportsPage: React.FC = () => {
  const { 
    documents, 
    audits, 
    findings, 
    departments, 
    sites, 
    exportDocumentsToExcel, 
    exportFindingsToExcel, 
    exportAuditReportToExcel 
  } = useApp();

  const [selectedReportType, setSelectedReportType] = useState<string>('EXECUTIVE_SUMMARY');
  const [selectedSite, setSelectedSite] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  // Filter calculations
  const effectiveDocs = documents.filter(d => d.status === 'Effective');
  const inReviewDocs = documents.filter(d => d.status === 'Submitted' || d.status === 'Under Review');
  const reviewDueSoonDocs = documents.filter(d => {
    const dueDate = new Date(d.reviewDueDate).getTime();
    const now = new Date('2026-10-17').getTime();
    const diff = (dueDate - now) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 90;
  });

  const openFindings = findings.filter(f => f.status !== 'Closed');
  const closedFindings = findings.filter(f => f.status === 'Closed');
  const overdueFindings = findings.filter(f => {
    if (f.status === 'Closed') return false;
    return new Date(f.dueDate).getTime() < new Date('2026-10-17').getTime();
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>PUSAT LAPORAN & DOKUMEN RESMI</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Laporan Eksekutif ISMS & Kepatuhan Audit</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Format laporan standar resmi siap cetak (PDF) dan ekspor spreadsheet Excel (.xlsx)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>Cetak / Simpan PDF</span>
          </button>

          <button
            onClick={() => {
              if (selectedReportType === 'DOCUMENTS_MASTER') exportDocumentsToExcel();
              else if (selectedReportType === 'FINDINGS_CAPA') exportFindingsToExcel();
              else exportDocumentsToExcel();
            }}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector & Filter (Hidden on Print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs print:hidden space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {[
            { id: 'EXECUTIVE_SUMMARY', label: 'Ringkasan Eksekutif Terpadu' },
            { id: 'DOCUMENTS_MASTER', label: 'Daftar Induk SOP & Dokumen' },
            { id: 'FINDINGS_CAPA', label: 'Rekapitulasi Temuan & CAR' },
            { id: 'REVIEW_DUE', label: 'Dokumen Mendekati Masa Review' },
            { id: 'OVERDUE_TRACKER', label: 'Tindakan Overdue (Kritis)' }
          ].map(rep => (
            <button
              key={rep.id}
              onClick={() => setSelectedReportType(rep.id)}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedReportType === rep.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {rep.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter Site Tambang:</label>
            <select
              value={selectedSite}
              onChange={e => setSelectedSite(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
            >
              <option value="all">Semua Site (Sangatta, Batulicin, HO Jakarta)</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-slate-500 font-semibold mb-1">Filter Departemen:</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
            >
              <option value="all">Semua Departemen (SHE, Mining, Maintenance, Plant, Log)</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Official Report Document Paper (Visible in Preview & Print) */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-900">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-xl flex items-center justify-center font-extrabold text-xl font-mono">
              SDM
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide uppercase">PT SUMBER DAYA MINERAL NUSANTARA TBK</h1>
              <h2 className="text-xs font-bold text-slate-600">DIVISI SAFETY, HEALTH, ENVIRONMENT & QUALITY (SHEQ)</h2>
              <p className="text-[10px] text-slate-500">Izin Usaha Pertambangan Operasi Produksi (IUP OP) No. 503/IUP-OP/ESDM/2021</p>
            </div>
          </div>

          <div className="text-right text-[11px] font-mono">
            <div><strong>No. Laporan:</strong> ISMS/REP/{new Date().getFullYear()}/007</div>
            <div><strong>Tanggal Cetak:</strong> 17 Oktober 2026</div>
            <div><strong>Klasifikasi:</strong> Internal Confidential</div>
          </div>
        </div>

        {/* Report Title */}
        <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">
            {selectedReportType === 'EXECUTIVE_SUMMARY' && 'LAPORAN REKAPITULASI EKSEKUTIF KEPATUHAN SMKP MINERBA & ISO'}
            {selectedReportType === 'DOCUMENTS_MASTER' && 'DAFTAR INDUK DOKUMEN, SOP & INSTRUKSI KERJA BERLAKU'}
            {selectedReportType === 'FINDINGS_CAPA' && 'LAPORAN REKAPITULASI KETIDAKSESUAIAN & CORRECTIVE ACTION (CAR)'}
            {selectedReportType === 'REVIEW_DUE' && 'DAFTAR DOKUMEN MENDEKATI JATUH TEMPO PENINJAUAN BERKALA'}
            {selectedReportType === 'OVERDUE_TRACKER' && 'LAPORAN MONITORING TEMUAN OVERDUE & RISIKO TINGGI'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Periode Audit Semester II Tahun 2026 • Wilayah Operasi Pit Sangatta Block North
          </p>
        </div>

        {/* Report Content View */}
        {selectedReportType === 'EXECUTIVE_SUMMARY' && (
          <div className="space-y-6 text-xs">
            {/* KPI Summary Block */}
            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Total SOP / Dokumen</div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">{documents.length}</div>
                <div className="text-[10px] text-emerald-600 font-medium">{effectiveDocs.length} Dokumen Berlaku</div>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                <div className="text-[10px] text-amber-800 font-bold uppercase">Kepatuhan SMKP Minerba</div>
                <div className="text-xl font-extrabold text-amber-700 mt-0.5">84%</div>
                <div className="text-[10px] text-amber-900 font-medium">Kepdirjen 185/2019</div>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200 text-center">
                <div className="text-[10px] text-indigo-800 font-bold uppercase">Kepatuhan ISO Terpadu</div>
                <div className="text-xl font-extrabold text-indigo-700 mt-0.5">88%</div>
                <div className="text-[10px] text-indigo-900 font-medium">ISO 9001/14001/45001</div>
              </div>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-center">
                <div className="text-[10px] text-red-800 font-bold uppercase">Status Temuan CAR</div>
                <div className="text-xl font-extrabold text-red-700 mt-0.5">{openFindings.length} Open</div>
                <div className="text-[10px] text-slate-600 font-medium">{closedFindings.length} Berhasil Ditutup</div>
              </div>
            </div>

            {/* Narrative Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed text-slate-800 space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900">1. Ringkasan Kinerja Keselamatan Pertambangan:</h4>
              <p>
                Berdasarkan hasil audit kepatuhan terintegrasi semester berjalan, sistem tata kelola dokumen ISMS telah mengendalikan <strong>{documents.length} dokumen operasional</strong> dengan tingkat ketersediaan prosedur baku sebesar <strong>100%</strong> pada seluruh proses berisiko tinggi.
              </p>
              <p>
                Capaian implementasi 7 Elemen SMKP Minerba Kepdirjen 185 saat ini berada pada angka <strong>84%</strong>, dengan Elemen I (Kebijakan) dan Elemen VI (Dokumentasi) mencatatkan pemenuhan tertinggi di atas 90%. Area perbaikan prioritas difokuskan pada Elemen IV (Implementasi Pengelolaan Operasional dan Izin Kerja Panas SIKA).
              </p>
            </div>

            {/* Open Findings Table */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wide text-slate-900 mb-2">2. Daftar Temuan Kritis Yang Memerlukan Tindakan:</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2.5">No. Temuan</th>
                      <th className="p-2.5">Kategori</th>
                      <th className="p-2.5">Judul Temuan</th>
                      <th className="p-2.5">PIC</th>
                      <th className="p-2.5">Target</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {findings.map(f => (
                      <tr key={f.id}>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{f.findingNumber}</td>
                        <td className="p-2.5 font-semibold text-red-700">{f.category}</td>
                        <td className="p-2.5 text-slate-800">{f.title}</td>
                        <td className="p-2.5 text-slate-600">{f.picName.split(' ')[0]}</td>
                        <td className="p-2.5 text-slate-600">{f.dueDate}</td>
                        <td className="p-2.5 font-bold">{f.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {selectedReportType === 'DOCUMENTS_MASTER' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">No. Dokumen</th>
                  <th className="p-2.5">Judul Dokumen</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Departemen</th>
                  <th className="p-2.5">Revisi</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Review Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(d => (
                  <tr key={d.id}>
                    <td className="p-2.5 font-mono font-bold">{d.docNumber}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{d.title}</td>
                    <td className="p-2.5">{d.category}</td>
                    <td className="p-2.5">{d.departmentName.split(' ')[0]}</td>
                    <td className="p-2.5 font-mono">{d.currentRevision}</td>
                    <td className="p-2.5">{d.status}</td>
                    <td className="p-2.5 text-slate-600">{d.reviewDueDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReportType === 'FINDINGS_CAPA' && (
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left divide-y divide-slate-200">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2.5">No. Temuan</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Judul</th>
                  <th className="p-2.5">Akar Masalah (RCA)</th>
                  <th className="p-2.5">PIC</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {findings.map(f => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-mono font-bold">{f.findingNumber}</td>
                    <td className="p-2.5 font-semibold">{f.category}</td>
                    <td className="p-2.5 text-slate-800">{f.title}</td>
                    <td className="p-2.5 text-slate-600 max-w-xs">{f.rootCauseAnalysis || '-'}</td>
                    <td className="p-2.5">{f.picName.split(' ')[0]}</td>
                    <td className="p-2.5 font-bold">{f.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Block (Standard Enterprise Mining Compliance) */}
        <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="text-slate-400 font-medium mb-16">Disusun Oleh:</div>
            <div className="font-bold text-slate-900 border-b border-slate-400 pb-1 mx-4">Agus Prasetyo, S.T.</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Auditor Internal SMKP</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium mb-16">Diperiksa & Diverifikasi Oleh:</div>
            <div className="font-bold text-slate-900 border-b border-slate-400 pb-1 mx-4">Ir. Hendra Wijaya, IPM</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Lead Auditor SMKP & Manager SHE</div>
          </div>

          <div>
            <div className="text-slate-400 font-medium mb-16">Disahkan & Disetujui Oleh:</div>
            <div className="font-bold text-slate-900 border-b border-slate-400 pb-1 mx-4">Bambang Kusuma, S.T.</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Kepala Teknik Tambang (KTT)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
