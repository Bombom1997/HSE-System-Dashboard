import React, { useState } from 'react';
import { 
  HardHat, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  Edit3, 
  FileText, 
  ShieldCheck, 
  ChevronDown, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SMKPCriteria } from '../types';

export const SMKPMasterPage: React.FC = () => {
  const { smkpMaster, updateSMKPCriteria, currentUser, documents } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedElementId, setSelectedElementId] = useState<number>(1);
  const [editingCriteria, setEditingCriteria] = useState<SMKPCriteria | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    requirementText: '',
    expectedEvidence: '',
    verificationGuidance: ''
  });

  const activeElement = smkpMaster.find(e => e.id === selectedElementId) || smkpMaster[0];

  const handleOpenEdit = (crit: SMKPCriteria) => {
    setEditingCriteria(crit);
    setEditForm({
      requirementText: crit.requirementText,
      expectedEvidence: crit.expectedEvidence,
      verificationGuidance: crit.verificationGuidance
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriteria) return;
    updateSMKPCriteria(editingCriteria.id, editForm);
    setEditingCriteria(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <HardHat className="w-4 h-4" />
            <span>STANDAR REGULASI RESMI MINERBA</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">
            Master Audit SMKP Minerba (Kepdirjen No. 185.K/37.04/DJB/2019)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar 7 elemen, subelemen, kriteria audit, bukti pemenuhan, dan panduan verifikasi terverifikasi
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 text-amber-900">
          <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Status Rujukan: <strong>Terverifikasi Lampiran I & II Kepdirjen 185</strong></span>
        </div>
      </div>

      {/* 7 Elements Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {smkpMaster.map(elem => (
          <button
            key={elem.id}
            onClick={() => setSelectedElementId(elem.id)}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedElementId === elem.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-mono font-bold ${selectedElementId === elem.id ? 'text-amber-400' : 'text-amber-600'}`}>
                Elemen {elem.romanNumber}
              </div>
              <div className="text-xs font-semibold mt-0.5 line-clamp-1">{elem.title}</div>
            </div>
            <div className={`text-[10px] mt-2 font-bold px-1.5 py-0.5 rounded-md inline-block w-fit ${
              selectedElementId === elem.id ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
            }`}>
              Bobot: {elem.weightPercentage}%
            </div>
          </button>
        ))}
      </div>

      {/* Selected Element Header */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div>
          <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            Elemen {activeElement.romanNumber} • Bobot Penilaian {activeElement.weightPercentage}%
          </div>
          <h3 className="text-base font-extrabold mt-0.5">{activeElement.title}</h3>
          <p className="text-xs text-slate-300 mt-1">{activeElement.description}</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
          {activeElement.subElements.length} Sub-Elemen Aktif
        </div>
      </div>

      {/* Sub-elements and Criteria Accordion */}
      <div className="space-y-4">
        {activeElement.subElements.map(sub => (
          <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Sub-element Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-700 text-xs bg-amber-100 px-2 py-0.5 rounded-md mr-2">
                  {sub.code}
                </span>
                <span className="font-bold text-xs text-slate-900">{sub.title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">{sub.description}</p>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {sub.criteria.length} Kriteria
              </span>
            </div>

            {/* Criteria List */}
            <div className="divide-y divide-slate-100">
              {sub.criteria.map(crit => {
                // Find mapped documents
                const mappedDocs = documents.filter(d => 
                  d.mappedSMKPElements.some(m => m === sub.code || crit.code.startsWith(m) || m === crit.code)
                );

                return (
                  <div key={crit.id} className="p-4 hover:bg-slate-50/70 transition space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="font-mono font-bold text-slate-900 text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded-md shrink-0">
                          {crit.code}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                            {crit.requirementText}
                          </p>
                          <div className="text-[11px] text-amber-700 font-medium mt-1">
                            Referensi Hukum: {crit.regulatoryReference}
                          </div>
                        </div>
                      </div>

                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => handleOpenEdit(crit)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition shrink-0"
                          title="Edit Deskripsi Persyaratan (Admin)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Expected Evidence & Verification Guidance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px]">
                      <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100">
                        <span className="font-bold text-blue-900 block mb-0.5">Bukti Pemenuhan yang Diharapkan:</span>
                        <p className="text-slate-700">{crit.expectedEvidence}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <span className="font-bold text-emerald-900 block mb-0.5">Panduan Verifikasi Auditor:</span>
                        <p className="text-slate-700">{crit.verificationGuidance}</p>
                      </div>
                    </div>

                    {/* Mapped Documents in System */}
                    {mappedDocs.length > 0 && (
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase text-slate-400">SOP Terkait:</span>
                        {mappedDocs.map(doc => (
                          <span key={doc.id} className="bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded-md text-[10px] font-mono font-medium">
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

      {/* Edit Criteria Modal */}
      {editingCriteria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Kriteria SMKP {editingCriteria.code}</h3>
              <button onClick={() => setEditingCriteria(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bunyi Persyaratan Kriteria *</label>
                <textarea
                  required
                  rows={3}
                  value={editForm.requirementText}
                  onChange={e => setEditForm({ ...editForm, requirementText: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bukti Pemenuhan yang Diharapkan</label>
                <textarea
                  rows={2}
                  value={editForm.expectedEvidence}
                  onChange={e => setEditForm({ ...editForm, expectedEvidence: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Panduan Verifikasi Auditor</label>
                <textarea
                  rows={2}
                  value={editForm.verificationGuidance}
                  onChange={e => setEditForm({ ...editForm, verificationGuidance: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setEditingCriteria(null)} className="px-3 py-1.5 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
