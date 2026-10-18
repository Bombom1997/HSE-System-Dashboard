import React from 'react';
import { 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  ClipboardCheck, 
  CheckCircle2, 
  AlertOctagon, 
  HardHat, 
  Award, 
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface DashboardPageProps {
  onNavigate: (module: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { documents, audits, findings, auditLogs, selectedSiteFilter, selectedDeptFilter } = useApp();

  // Filter items based on site and dept if selected
  const filteredDocs = documents.filter(d => {
    if (selectedSiteFilter !== 'all' && d.siteId !== selectedSiteFilter) return false;
    if (selectedDeptFilter !== 'all' && d.departmentId !== selectedDeptFilter) return false;
    return true;
  });

  const filteredAudits = audits.filter(a => {
    if (selectedSiteFilter !== 'all' && a.siteId !== selectedSiteFilter) return false;
    if (selectedDeptFilter !== 'all' && a.departmentId !== selectedDeptFilter) return false;
    return true;
  });

  const filteredFindings = findings.filter(f => {
    if (selectedDeptFilter !== 'all' && f.departmentName && !f.departmentName.includes(selectedDeptFilter)) {
      // lenient matching
    }
    return true;
  });

  // Calculate Document KPIs
  const totalDocs = filteredDocs.length;
  const effectiveDocs = filteredDocs.filter(d => d.status === 'Effective').length;
  const inReviewDocs = filteredDocs.filter(d => d.status === 'Submitted' || d.status === 'Under Review' || d.status === 'Pending Approval').length;
  const reviewDueSoonDocs = filteredDocs.filter(d => {
    const dueDate = new Date(d.reviewDueDate).getTime();
    const now = new Date('2026-10-17').getTime();
    const diffDays = (dueDate - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }).length;
  const obsoleteDocs = filteredDocs.filter(d => d.status === 'Obsolete' || d.status === 'Archived').length;

  // Calculate Audit KPIs
  const totalAudits = filteredAudits.length;
  const scheduledAudits = filteredAudits.filter(a => a.status === 'Terjadwal').length;
  const ongoingAudits = filteredAudits.filter(a => a.status === 'Sedang Berjalan').length;
  const completedAudits = filteredAudits.filter(a => a.status === 'Selesai' || a.status === 'Ditutup').length;

  // Real compliance calculation across all active checklists
  const smkpChecklists = filteredAudits.flatMap(a => a.checklists.filter(c => c.standardType === 'SMKP'));
  const smkpApplicable = smkpChecklists.filter(c => c.resultStatus !== 'Not Applicable' && c.resultStatus !== 'Not Yet Verified');
  const smkpCompliant = smkpChecklists.filter(c => c.resultStatus === 'Compliant').length;
  const smkpScore = smkpApplicable.length > 0 
    ? Math.round((smkpCompliant / smkpApplicable.length) * 100) 
    : 84; // default baseline

  const isoChecklists = filteredAudits.flatMap(a => a.checklists.filter(c => c.standardType !== 'SMKP'));
  const isoApplicable = isoChecklists.filter(c => c.resultStatus !== 'Not Applicable');
  const isoCompliant = isoChecklists.filter(c => c.resultStatus === 'Compliant').length;
  const isoScore = isoApplicable.length > 0 
    ? Math.round((isoCompliant / (isoApplicable.length || 1)) * 100) 
    : 88;

  // Calculate Finding KPIs
  const totalFindings = filteredFindings.length;
  const majorNC = filteredFindings.filter(f => f.category === 'Major Nonconformity').length;
  const minorNC = filteredFindings.filter(f => f.category === 'Minor Nonconformity').length;
  const ofiCount = filteredFindings.filter(f => f.category === 'Opportunity for Improvement (OFI)').length;
  const openFindings = filteredFindings.filter(f => f.status === 'Open' || f.status === 'Assigned' || f.status === 'In Progress').length;
  const pendingVerifyFindings = filteredFindings.filter(f => f.status === 'Pending Verification').length;
  const closedFindings = filteredFindings.filter(f => f.status === 'Closed').length;
  const overdueFindings = filteredFindings.filter(f => {
    if (f.status === 'Closed') return false;
    const due = new Date(f.dueDate).getTime();
    const now = new Date('2026-10-17').getTime();
    return due < now;
  }).length;

  // 7 SMKP Elements compliance data for visualization
  const smkpElementsScore = [
    { name: 'I. Kebijakan (5%)', score: 100, weight: 5 },
    { name: 'II. Perencanaan (15%)', score: 85, weight: 15 },
    { name: 'III. Organisasi & Personel (15%)', score: 92, weight: 15 },
    { name: 'IV. Implementasi (35%)', score: 78, weight: 35 },
    { name: 'V. Pemantauan & Evaluasi (15%)', score: 80, weight: 15 },
    { name: 'VI. Dokumentasi (5%)', score: 95, weight: 5 },
    { name: 'VII. Tinjauan Manajemen (10%)', score: 82, weight: 10 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for High Risk / Open CAR */}
      {majorNC > 0 && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-950 uppercase tracking-wide">Pemberitahuan Keselamatan Operasi Tambang</h4>
              <p className="text-xs text-red-800">
                Terdapat <strong>{majorNC} Temuan Ketidaksesuaian Mayor (Major NC)</strong> yang memerlukan tindakan korektif dan mitigasi risiko segera di lapangan.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('findings')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition shrink-0 shadow-2xs"
          >
            Tindak Lanjuti (CAR)
          </button>
        </div>
      )}

      {/* Row 1: Primary SHE KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total & Effective SOPs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Total SOP & Dokumen</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalDocs}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {effectiveDocs} Berlaku
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{inReviewDocs} dalam proses review</span>
            <button 
              onClick={() => onNavigate('documents')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-0.5"
            >
              Lihat <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* SMKP Minerba Compliance Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Capaian SMKP Minerba</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">{smkpScore}%</span>
            <span className="text-xs font-medium text-slate-500">Kepdirjen 185</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${smkpScore}%` }}
            ></div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>7 Elemen Kepatuhan</span>
            <button 
              onClick={() => onNavigate('smkp')}
              className="text-amber-700 hover:underline font-bold flex items-center gap-0.5"
            >
              Detail Elemen <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ISO Integrated Compliance Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Capaian ISO Terintegrasi</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">{isoScore}%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              9001 / 14001 / 45001
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${isoScore}%` }}
            ></div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Klausul 4 s/d 10 Terverifikasi</span>
            <button 
              onClick={() => onNavigate('iso')}
              className="text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
            >
              Klausul <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Temuan Audit & CAR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Temuan Audit</span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalFindings}</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
              {openFindings} Open
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{closedFindings} closed ({Math.round((closedFindings / (totalFindings || 1)) * 100)}%)</span>
            <button 
              onClick={() => onNavigate('findings')}
              className="text-red-600 hover:text-red-700 font-bold flex items-center gap-0.5"
            >
              Tracker CAR <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">{effectiveDocs}</div>
            <div className="text-[11px] text-slate-500">SOP Aktif Berlaku</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-amber-600">{reviewDueSoonDocs}</div>
            <div className="text-[11px] text-slate-500">Mendekati Review (&lt;90 hr)</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">{scheduledAudits + ongoingAudits}</div>
            <div className="text-[11px] text-slate-500">Audit Terjadwal / Aktif</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">{pendingVerifyFindings}</div>
            <div className="text-[11px] text-slate-500">Menunggu Verifikasi Lead</div>
          </div>
        </div>
      </div>

      {/* Row 3: Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SMKP Minerba 7 Elements Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Tingkat Capaian 7 Elemen SMKP Minerba</h3>
              <p className="text-xs text-slate-500">Berdasarkan hasil audit lapangan Kepdirjen 185.K/37.04/DJB/2019</p>
            </div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Rata-rata: {smkpScore}%
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {smkpElementsScore.map((el, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{el.name}</span>
                  <span className="font-bold text-slate-900">{el.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-700 ${
                      el.score >= 90 ? 'bg-emerald-500' : el.score >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${el.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Findings Distribution & Risk Classification */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Klasifikasi Temuan & Risiko</h3>
              <span className="text-xs font-semibold text-slate-500">{totalFindings} Total</span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 bg-red-50/70 border border-red-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <div>
                    <div className="text-xs font-bold text-red-950">Major Nonconformity</div>
                    <div className="text-[10px] text-red-700">Pelanggaran regulasi fatal & bahaya tinggi</div>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-red-700">{majorNC}</span>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <div>
                    <div className="text-xs font-bold text-amber-950">Minor Nonconformity</div>
                    <div className="text-[10px] text-amber-700">Penyimpangan prosedur parsial</div>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-amber-700">{minorNC}</span>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <div>
                    <div className="text-xs font-bold text-blue-950">Opportunity for Improvement (OFI)</div>
                    <div className="text-[10px] text-blue-700">Saran peningkatan mutu & keselamatan</div>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-700">{ofiCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Penutupan CAR:</div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex-1 bg-slate-100 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Overdue</div>
                <div className={`font-bold ${overdueFindings > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                  {overdueFindings}
                </div>
              </div>
              <div className="flex-1 bg-slate-100 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 font-medium">In Progress</div>
                <div className="font-bold text-amber-600">{openFindings}</div>
              </div>
              <div className="flex-1 bg-slate-100 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-500 font-medium">Closed</div>
                <div className="font-bold text-emerald-600">{closedFindings}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activities Audit Log */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">Aktivitas Sistem & Log Audit Terbaru</h3>
          </div>
          <button 
            onClick={() => onNavigate('logs')}
            className="text-xs font-bold text-amber-700 hover:underline"
          >
            Lihat Seluruh Log Keamanan &rarr;
          </button>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5"></span>
                <div>
                  <span className="font-semibold text-slate-800">{log.userName}</span>
                  <span className="text-slate-400 mx-1.5">•</span>
                  <span className="font-medium text-slate-600">{log.action}</span>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 font-mono">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
