import React, { useState } from 'react';
import { X, User, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile, changeUserPassword } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [phone, setPhone] = useState(currentUser.phone);
  const [position, setPosition] = useState(currentUser.position);
  
  // Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName,
      phone,
      position
    });
    setMessage({ text: 'Profil pengguna berhasil diperbarui.', type: 'success' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPass) {
      setMessage({ text: 'Masukkan kata sandi lama Anda.', type: 'error' });
      return;
    }
    if (newPass.length < 6) {
      setMessage({ text: 'Kata sandi baru minimal harus 6 karakter.', type: 'error' });
      return;
    }
    if (newPass !== confirmPass) {
      setMessage({ text: 'Konfirmasi kata sandi baru tidak cocok.', type: 'error' });
      return;
    }

    const res = changeUserPassword(currentUser.id, currentPass, newPass);
    if (!res.success) {
      setMessage({ text: res.message, type: 'error' });
      return;
    }

    setMessage({ text: 'Kata sandi berhasil diubah secara aman.', type: 'success' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Profil & Keamanan Akun</h3>
              <p className="text-xs text-slate-400">Pengaturan identitas dan otentikasi ISMS</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-6 text-xs font-semibold">
          <button
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'profile' 
                ? 'border-amber-500 text-amber-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Informasi Pribadi</span>
          </button>
          <button
            onClick={() => { setActiveTab('password'); setMessage(null); }}
            className={`pb-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'password' 
                ? 'border-amber-500 text-amber-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Ganti Kata Sandi</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {message && (
            <div className={`mb-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Pengguna (Akun)</label>
                <input 
                  type="email" 
                  value={currentUser.email} 
                  disabled 
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Departemen</label>
                  <input 
                    type="text" 
                    value={currentUser.departmentName} 
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Tambang</label>
                  <input 
                    type="text" 
                    value={currentUser.siteName} 
                    disabled 
                    className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan & Sertifikasi Tambang</label>
                <input 
                  type="text" 
                  value={position} 
                  onChange={e => setPosition(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon / Handphone</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Role Sistem: </span>
                  <span className="font-bold text-amber-600">{currentUser.role}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                  <span>Row Level Security Aktif</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Saat Ini</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={currentPass} 
                  onChange={e => setCurrentPass(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi Baru</label>
                <input 
                  type="password" 
                  placeholder="Minimal 6 karakter"
                  value={newPass} 
                  onChange={e => setNewPass(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Kata Sandi Baru</label>
                <input 
                  type="password" 
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPass} 
                  onChange={e => setConfirmPass(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition shadow-sm"
                >
                  Perbarui Kata Sandi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
