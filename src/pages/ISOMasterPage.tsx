import React, { useState } from 'react';
import { 
  Award, 
  Search, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  FileText,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ISOMasterPage: React.FC = () => {
  const { isoMaster, documents } = useApp();

  const [activeTab, setActiveTab] = useState<'iso-9001' | 'iso-14001' | 'iso-45001'>('iso-9001');

  const selectedStandard = isoMaster.find(s => s.id === activeTab) || isoMaster[0];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-1">
            <Award className="w-4 h-4" />
            <span>STANDAR INTERNASIONAL TERINTEGRASI</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Master Persyaratan ISO Terintegrasi (9001, 14001, 45001)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Struktur tingkat tinggi (High-Level Structure) Klausul 4 s/d 10 terverifikasi untuk operasional pertambangan
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-indigo-900">
          <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Status: <strong>Edisi Resmi Terverifikasi (Klausul 4-10)</strong></span>
        </div>
      </div>

      {/* Tabs ISO 9001, 14001, 45001 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {isoMaster.map(std => {
          const isSelected = activeTab === std.id;
          return (
            <button
              key={std.id}
              onClick={() => setActiveTab(std.id as any)}
              className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' 
                  : 'bg-white text-slate-800 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isSelected ? 'text-amber-400' : 'text-indigo-600'
                }`}>
                  {std.code}
                </span>
                <h3 className="font-bold text-sm mt-1">{std.name}</h3>
                <p className={`text-xs mt-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {std.edition}
                </p>
              </div>
              <div className={`mt-3 text-[11px] font-semibold ${isSelected ? 'text-amber-300' : 'text-indigo-600'}`}>
                {std.clauses.length} Klausul Utama &rarr;
              </div>
            </button>
          );
        })}
      </div>

      {/* Standard Summary Header */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-mono text-amber-400 font-bold uppercase">{selectedStandard.code}</span>
          <h3 className="text-base font-bold mt-0.5">{selectedStandard.name}</h3>
        </div>
        <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300">
          High Level Structure (HLS)
        </div>
      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {selectedStandard.clauses.map(clause => (
          <div key={clause.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center font-mono">
                  {clause.clauseNumber}
                </span>
                <span className="font-bold text-xs text-slate-900">Klausul {clause.clauseNumber}: {clause.title}</span>
              </div>
              <span className="text-[11px] text-slate-400">{clause.requirements.length} Sub-klausul</span>
            </div>

            <div className="divide-y divide-slate-100">
              {clause.requirements.map(req => {
                const mappedDocs = documents.filter(d => 
                  d.mappedISOClauses.some(m => m.includes(req.subClauseCode) || m.toLowerCase().includes(req.clauseId.toLowerCase()))
                );

                return (
                  <div key={req.id} className="p-4 hover:bg-slate-50/70 transition space-y-3">
                    <div className="flex items-start gap-2.5">
                      <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded-md shrink-0">
                        {req.subClauseCode}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{req.title}</h4>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{req.verifiedSummary}</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100 text-[11px]">
                      <span className="font-bold text-indigo-950 block mb-0.5">Bukti Implementasi Tambang:</span>
                      <p className="text-slate-700">{req.expectedEvidence}</p>
                    </div>

                    {mappedDocs.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap text-[10px]">
                        <span className="font-bold uppercase text-slate-400">Dokumen SOP Pendukung:</span>
                        {mappedDocs.map(doc => (
                          <span key={doc.id} className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono">
                            {doc.docNumber} ({doc.currentRevision})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
