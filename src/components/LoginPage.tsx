import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  HardHat,
  Award,
  BookOpen,
  UserPlus,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { loginUser, registerUser, departments, sites } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedRole, setCopiedRole] = useState<string | null>(null);

  // Modals
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('USER');
  const [regDeptId, setRegDeptId] = useState(departments[0]?.id || '');
  const [regSiteId, setRegSiteId] = useState(sites[0]?.id || '');
  const [regPosition, setRegPosition] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');

  // Check saved email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('isms_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Harap masukkan email dan kata sandi Anda.');
      return;
    }

    const res = loginUser(email, password, rememberMe);
    if (res.success) {
      setSuccessMessage('Autentikasi berhasil! Mengarahkan ke dashboard...');
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      setErrorMessage(res.message);
    }
  };

  const handleFillCredentials = (userEmail: string, userPass: string, roleName: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMessage('');
    setCopiedRole(roleName);
    setTimeout(() => setCopiedRole(null), 2500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const res = registerUser({
      email: regEmail,
      password: regPassword,
      fullName: regFullName,
      role: regRole,
      departmentId: regDeptId,
      siteId: regSiteId,
      position: regPosition || 'Staff Operasional Tambang',
      phone: regPhone || '+62 812-0000-0000'
    });

    if (res.success) {
      setShowRegisterModal(false);
      setEmail(regEmail);
      setPassword(regPassword);
      setSuccessMessage(res.message);
      // Reset registration form
      setRegFullName('');
      setRegEmail('');
      setRegPassword('');
      setRegPosition('');
      setRegPhone('');
    } else {
      setRegError(res.message);
    }
  };

  const demoAccounts = [
    {
      role: 'ADMIN',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/30',
      name: 'Ir. Hendra Wijaya, IPM (Lead SHE)',
      email: 'admin.she@minerba-isms.com',
      password: 'admin123',
      desc: 'Akses penuh administrasi, approval SOP, verifikasi temuan CAR'
    },
    {
      role: 'USER',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      name: 'Bambang Kusuma, S.T. (Mine Supt)',
      email: 'bambang.ops@minerba-isms.com',
      password: 'user123',
      desc: 'Pengajuan dokumen, pengisian checklist audit, input tindakan korektif'
    },
    {
      role: 'VIEWER',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      name: 'Siti Rahmawati, M.M. (Risk Auditor)',
      email: 'management.view@minerba-isms.com',
      password: 'viewer123',
      desc: 'Melihat dokumen resmi berlaku & ringkasan capaian (Read-Only)'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-white font-sans">
      {/* Background Mining Aesthetic Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]"></div>
      
      {/* Ambient Lighting */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">ISMS MINERBA</h1>
            <p className="text-xs text-amber-400 font-semibold tracking-wider uppercase mt-0.5">
              Integrated SHE & Audit Management System
            </p>
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Sistem Terintegrasi Pengelolaan SOP, Kepatuhan SMKP Minerba Kepdirjen 185, dan ISO 9001 / 14001 / 45001
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Masuk Akun Pengguna</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Masukkan alamat email dan kata sandi Anda</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Sesi Aman Terenkripsi
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Alamat Email Pengguna <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="nama.pengguna@minerba-isms.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Kata Sandi <span className="text-amber-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline transition"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Masukkan kata sandi akun"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition p-0.5"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/30"
                />
                <span>Ingat alamat email saya di perangkat ini</span>
              </label>

              <button
                type="button"
                onClick={() => setShowRegisterModal(true)}
                className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun Baru</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Masuk Menggunakan Email & Kata Sandi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Akun Uji Coba Kredensial Resmi:</span>
              </span>
              <span className="text-[10px] text-slate-500">Klik untuk isi otomatis form</span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map(acc => (
                <div 
                  key={acc.role} 
                  className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                      <span className="font-semibold text-slate-200 truncate">{acc.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                      Email: <span className="text-slate-300">{acc.email}</span> • Password: <span className="text-amber-400 font-semibold">{acc.password}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFillCredentials(acc.email, acc.password, acc.role)}
                    className="shrink-0 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="Gunakan akun ini untuk mengisi form login"
                  >
                    {copiedRole === acc.role ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Terisi!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Isi Form</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <div>PT SUMBER DAYA MINERAL NUSANTARA TBK • SITE SANGATTA</div>
          <div>Memenuhi Regulasi Keselamatan Pertambangan Kepdirjen Minerba No. 185.K/37.04/DJB/2019</div>
        </div>
      </div>

      {/* MODAL: Register New Account */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md text-slate-200 text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Daftar Akun Baru ISMS</h3>
              </div>
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {regError && (
              <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 rounded-lg text-xs">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Doni Prasetya, S.T."
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Alamat Email Perusahaan *</label>
                <input
                  type="email"
                  required
                  placeholder="doni.p@minerba-isms.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kata Sandi Baru * (Min. 6 Karakter)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Peran Akun</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                  >
                    <option value="USER">USER (Operasional / Auditor)</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Departemen</label>
                  <select
                    value={regDeptId}
                    onChange={e => setRegDeptId(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.code}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Jabatan & Lisensi Tambang</label>
                <input
                  type="text"
                  placeholder="Pengawas Lapangan (POP)"
                  value={regPosition}
                  onChange={e => setRegPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nomor Telepon / WA</label>
                <input
                  type="text"
                  placeholder="+62 812-xxxx-xxxx"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Forgot Password */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm text-slate-200 text-xs space-y-4">
            <h3 className="font-bold text-sm text-white">Bantuan Reset Kata Sandi</h3>
            <p className="text-slate-400 leading-relaxed">
              Untuk kepatuhan keamanan audit SMKP Minerba, pemulihan kata sandi dilakukan secara terverifikasi melalui Administrator Departemen SHE.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] space-y-1.5">
              <div><strong>Email Administrator SHE:</strong> admin.she@minerba-isms.com</div>
              <div><strong>Kata Sandi Default:</strong> admin123 / user123 / viewer123</div>
              <div><strong>Helpdesk IT Tambang:</strong> Ext. 4410 (Pit Sangatta)</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl cursor-pointer"
              >
                Tutup Bantuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
