import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, UploadCloud, Download, CheckCircle2, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { importMasterFromExcel } = useApp();

  const [importType, setImportType] = useState<'documents' | 'smkp' | 'iso'>('documents');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [importedCount, setImportedCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrors([]);
    setIsSuccess(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setErrors(['File Excel tidak memiliki data pada lembar pertama.']);
          return;
        }

        // Validate structure
        const firstRow: any = jsonData[0];
        if (importType === 'documents') {
          if (!firstRow['Nomor Dokumen'] && !firstRow.docNumber) {
            setErrors(['Kolom "Nomor Dokumen" tidak ditemukan. Pastikan menggunakan format template yang benar.']);
            return;
          }
        }

        setParsedData(jsonData);
      } catch (err: any) {
        setErrors([`Gagal membaca file: ${err.message}`]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nomor Dokumen': 'SOP-MINE-099',
        'Judul Dokumen': 'SOP Prosedur Pengujian Rem Dump Truck (Brake Test)',
        'Kategori': 'SOP',
        'Departemen': 'Mining Operations & Engineering',
        'Site': 'Pit Sangatta Block North',
        'Proses Bisnis': 'Perawatan Alat dan Keselamatan Pit',
        'Risiko SHE': 'Kegagalan sistem pengereman di turunan pit',
        'Revisi': 'Rev.00',
        'Tanggal Berlaku': '2026-10-15',
        'Status': 'Effective'
      },
      {
        'Nomor Dokumen': 'IK-SHE-042',
        'Judul Dokumen': 'Instruksi Kerja Pengukuran Kebisingan & Getaran Mekanik',
        'Kategori': 'IK',
        'Departemen': 'Safety, Health & Environment (SHE)',
        'Site': 'Pit Sangatta Block North',
        'Proses Bisnis': 'Higiene Industri & Kesehatan Kerja',
        'Risiko SHE': 'Gangguan pendengaran pekerja (NIHL)',
        'Revisi': 'Rev.01',
        'Tanggal Berlaku': '2026-10-10',
        'Status': 'Effective'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Dokumen ISMS');
    XLSX.writeFile(wb, 'Template_Master_Dokumen_ISMS.xlsx');
  };

  const handleConfirmImport = () => {
    const result = importMasterFromExcel(importType, parsedData);
    if (result.success) {
      setIsSuccess(true);
      setImportedCount(result.count);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setParsedData([]);
      }, 2000);
    } else {
      setErrors([result.error || 'Terjadi kesalahan saat mengimpor data.']);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Import Data Master dari Excel</h3>
              <p className="text-xs text-slate-400">Unggah berkas spreadsheet .xlsx / .xls untuk penambahan massal</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Import Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Modul Import</label>
            <select
              value={importType}
              onChange={(e) => {
                setImportType(e.target.value as any);
                setParsedData([]);
                setErrors([]);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="documents">Database Dokumen & SOP (Nomor, Judul, Kategori, Departemen)</option>
              <option value="smkp">Kriteria SMKP Minerba Kepdirjen 185</option>
              <option value="iso">Klausul Persyaratan ISO Terintegrasi</option>
            </select>
          </div>

          {/* Download Template Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-amber-900">Belum memiliki format template resmi?</h4>
              <p className="text-[11px] text-amber-700">Unduh format template spreadsheet standar untuk menghindari kesalahan struktur kolom.</p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-1.5 shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center transition cursor-pointer bg-slate-50/50">
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleFileUpload} 
              className="hidden" 
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer block">
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {fileName ? fileName : 'Pilih atau Seret Berkas Excel (.xlsx, .xls) ke Sini'}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Mendukung file Excel standar dengan header kolom yang valid.</p>
            </label>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Peringatan Validasi:</span>
              </div>
              {errors.map((err, i) => (
                <div key={i} className="pl-5 text-[11px]">{err}</div>
              ))}
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Berhasil mengimpor {importedCount} data master ke dalam database ISMS!</span>
            </div>
          )}

          {/* Preview Table */}
          {parsedData.length > 0 && !isSuccess && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">Pratinjau Data ({parsedData.length} baris terdeteksi):</span>
                <span className="text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">Format Sesuai</span>
              </div>
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg text-xs">
                <table className="w-full text-left divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-semibold text-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2">No. Dokumen</th>
                      <th className="p-2">Judul Dokumen</th>
                      <th className="p-2">Kategori</th>
                      <th className="p-2">Departemen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedData.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-medium text-amber-600">{row['Nomor Dokumen'] || row.docNumber}</td>
                        <td className="p-2 text-slate-800">{row['Judul Dokumen'] || row.title}</td>
                        <td className="p-2 text-slate-600">{row['Kategori'] || row.category}</td>
                        <td className="p-2 text-slate-600">{row['Departemen'] || row.departmentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.length > 5 && (
                <div className="text-[10px] text-slate-400 text-center mt-1">
                  ... dan {parsedData.length - 5} baris lainnya siap diimpor.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={parsedData.length === 0 || errors.length > 0 || isSuccess}
            onClick={handleConfirmImport}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Konfirmasi & Simpan ke Database</span>
          </button>
        </div>
      </div>
    </div>
  );
};
