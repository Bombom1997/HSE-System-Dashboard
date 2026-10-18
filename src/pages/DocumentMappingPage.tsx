import React, { useState } from 'react';
import { 
  Network, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Search, 
  Filter, 
  HelpCircle,
  HardHat,
  Award
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DocumentMappingPage: React.FC = () => {
  const { smkpMaster, isoMaster, documents } = useApp();

  const [selectedStandardTab, setSelectedStandardTab] = useState<'SMKP' | 'ISO 9001' | 'ISO 14001' | 'ISO 45001'>('SMKP');
  const [searchFilter, setSearchFilter] = useState('');

  // Collect all requirements for SMKP
  const smkpRequirementsList: {
    elementRoman: string;
    subCode: string;
    critCode: string;
    requirement: string;
    expectedEvidence: string;
  }[] = [];

  smkpMaster.forEach(el => {
    el.subElements.forEach(sub => {
      sub.criteria.forEach(crit => {
        smkpRequirementsList.push({
          elementRoman: el.romanNumber,
          subCode: sub.code,
          critCode: crit.code,
          requirement: crit.requirementText,
          expectedEvidence: crit.expectedEvidence
        });
      });
    });
  });

  // Collect all requirements for ISO
  const isoStandardSelected = isoMaster.find(i => i.type === selectedStandardTab);
  const isoRequirementsList: {
    clauseNum: number;
    subClauseCode: string;
    title: string;
    requirement: string;
    expectedEvidence: string;
  }[] = [];

  if (isoStandardSelected) {
    isoStandardSelected.clauses.forEach(c => {
      c.requirements.forEach(r => {
        isoRequirementsList.push({
          clauseNum: c.clauseNumber,
          subClauseCode: r.subClauseCode,
          title: r.title,
          requirement: r.verifiedSummary,
          expectedEvidence: r.expectedEvidence
        });
      });
    });
  }

  // Calculate matching status for each requirement
  const getRequirementDocStatus = (code: string, standard: string) => {
    // Find documents mapped to this code or element
    const mapped = documents.filter(doc => {
      if (standard === 'SMKP') {
        return doc.mappedSMKPElements.some(m => m === code || code.startsWith(m) || m.startsWith(code));
      } else {
        return doc.mappedISOClauses.some(m => m.toLowerCase().includes(code.toLowerCase()));
      }
    });

    if (mapped.length === 0) {
      return {
        status: 'UNCOVERED',
        label: 'Belum Memiliki Dokumen',
        badge: 'bg-red-50 text-red-700 border-red-200',
        docs: []
      };
    }

    const hasEffective = mapped.some(d => d.status === 'Effective');
    const hasOnlyDraft = mapped.every(d => d.status === 'Draft' || d.status === 'Submitted');
    const hasReviewNeeded = mapped.some(d => {
      const due = new Date(d.reviewDueDate).getTime();
      const now = new Date('2026-10-17').getTime();
      return due < now;
    });

    if (hasReviewNeeded) {
      return {
        status: 'NEEDS_REVIEW',
        label: 'Perlu Tinjauan Ulang (Expired/Overdue)',
        badge: 'bg-amber-50 text-amber-800 border-amber-300',
        docs: mapped
      };
    }

    if (hasEffective) {
      return {
        status: 'FULFILLED',
        label: 'Dokumen Terpenuhi (Berlaku)',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        docs: mapped
      };
    }

    if (hasOnlyDraft) {
      return {
        status: 'DRAFT_ONLY',
        label: 'Hanya Tersedia Dokumen Draft',
        badge: 'bg-blue-50 text-blue-800 border-blue-300',
        docs: mapped
      };
    }

    return {
      status: 'PARTIAL',
      label: 'Sebagian Terpenuhi',
      badge: 'bg-slate-100 text-slate-800 border-slate-300',
      docs: mapped
    };
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <Network className="w-4 h-4" />
            <span>INTEGRATED COMPLIANCE MATRIX</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Pemetaan Dokumen SOP Terhadap Kebutuhan SMKP & ISO</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Matriks keterkaitan satu dokumen ke berbagai standar regulasi pertambangan dan analisis kesenjangan (*Gap Analysis*)
          </p>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium bg-slate-50 p-2 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Terpenuhi Resmi
          </span>
          <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Hanya Draft
          </span>
          <span className="flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Perlu Tinjauan
          </span>
          <span className="flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Belum Didukung
          </span>
        </div>
      </div>

      {/* Standard Tab Picker */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSelectedStandardTab('SMKP')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            selectedStandardTab === 'SMKP'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>SMKP Minerba (7 Elemen)</span>
        </button>

        <button
          onClick={() => setSelectedStandardTab('ISO 9001')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            selectedStandardTab === 'ISO 9001'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ISO 9001:2015 (Mutu)</span>
        </button>

        <button
          onClick={() => setSelectedStandardTab('ISO 14001')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            selectedStandardTab === 'ISO 14001'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ISO 14001:2015 (Lingkungan)</span>
        </button>

        <button
          onClick={() => setSelectedStandardTab('ISO 45001')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-2 ${
            selectedStandardTab === 'ISO 45001'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>ISO 45001:2018 (K3 Tambang)</span>
        </button>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4 w-32">Klausul / Kriteria</th>
                <th className="py-3 px-4">Bunyi Persyaratan Sistem</th>
                <th className="py-3 px-4">Bukti Objektif yang Diharapkan</th>
                <th className="py-3 px-4 w-48">Status Pemenuhan</th>
                <th className="py-3 px-4">Dokumen Pendukung Terkait</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {selectedStandardTab === 'SMKP' ? (
                smkpRequirementsList.map((item, idx) => {
                  const evalStatus = getRequirementDocStatus(item.subCode, 'SMKP');
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          {item.critCode}
                        </span>
                        <div className="text-[11px] text-amber-700 font-semibold mt-1">Elemen {item.elementRoman}</div>
                      </td>
                      <td className="py-3 px-4 align-top text-slate-800 leading-relaxed font-medium">
                        {item.requirement}
                      </td>
                      <td className="py-3 px-4 align-top text-slate-600 text-[11px] leading-relaxed">
                        {item.expectedEvidence}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold border inline-block ${evalStatus.badge}`}>
                          {evalStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top">
                        {evalStatus.docs.length > 0 ? (
                          <div className="space-y-1.5">
                            {evalStatus.docs.map(doc => (
                              <div key={doc.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                                <div className="font-mono font-bold text-amber-700 text-[11px]">{doc.docNumber} ({doc.currentRevision})</div>
                                <div className="text-[11px] font-medium line-clamp-1">{doc.title}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-red-500 font-medium italic">
                            Belum ada SOP yang dipetakan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                isoRequirementsList.map((item, idx) => {
                  const evalStatus = getRequirementDocStatus(item.subClauseCode, selectedStandardTab);
                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 align-top">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                          Klausul {item.subClauseCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top text-slate-800 leading-relaxed font-medium">
                        <div className="font-bold text-slate-900 mb-0.5">{item.title}</div>
                        {item.requirement}
                      </td>
                      <td className="py-3 px-4 align-top text-slate-600 text-[11px] leading-relaxed">
                        {item.expectedEvidence}
                      </td>
                      <td className="py-3 px-4 align-top">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-bold border inline-block ${evalStatus.badge}`}>
                          {evalStatus.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 align-top">
                        {evalStatus.docs.length > 0 ? (
                          <div className="space-y-1.5">
                            {evalStatus.docs.map(doc => (
                              <div key={doc.id} className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-slate-800">
                                <div className="font-mono font-bold text-indigo-700 text-[11px]">{doc.docNumber} ({doc.currentRevision})</div>
                                <div className="text-[11px] font-medium line-clamp-1">{doc.title}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-red-500 font-medium italic">
                            Belum ada SOP yang dipetakan
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
