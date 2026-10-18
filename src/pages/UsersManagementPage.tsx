import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Building2, 
  MapPin, 
  KeyRound,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const UsersManagementPage: React.FC = () => {
  const { allUsers, toggleUserActiveStatus, addNewUser, departments, sites, currentUser } = useApp();

  const [searchUser, setSearchUser] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    email: '',
    password: 'user123',
    fullName: '',
    role: 'USER' as UserRole,
    departmentId: departments[0]?.id || '',
    siteId: sites[0]?.id || '',
    position: '',
    phone: '',
    isActive: true
  });

  const filteredUsers = allUsers.filter(u => {
    if (searchUser.trim()) {
      const q = searchUser.toLowerCase();
      return u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.position.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.email || !newUserForm.fullName) return;

    const dept = departments.find(d => d.id === newUserForm.departmentId);
    const site = sites.find(s => s.id === newUserForm.siteId);

    addNewUser({
      email: newUserForm.email,
      password: newUserForm.password || 'user123',
      fullName: newUserForm.fullName,
      role: newUserForm.role,
      departmentId: newUserForm.departmentId,
      departmentName: dept?.name || 'SHE',
      siteId: newUserForm.siteId,
      siteName: site?.name || 'Pit Sangatta',
      position: newUserForm.position || 'Pengawas Tambang (POP)',
      phone: newUserForm.phone || '+62 812-0000-0000',
      isActive: true,
      lastLogin: '-'
    });

    setShowAddModal(false);
    setNewUserForm({
      email: '',
      password: 'user123',
      fullName: '',
      role: 'USER',
      departmentId: departments[0]?.id || '',
      siteId: sites[0]?.id || '',
      position: '',
      phone: '',
      isActive: true
    });
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-red-200">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
        <h3 className="text-base font-bold text-red-800">Akses Terbatas (Unauthorized)</h3>
        <p className="text-xs text-slate-500 mt-1">Hanya Administrator SHE yang memiliki izin mengelola data pengguna sistem.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 mb-1">
            <Users className="w-4 h-4" />
            <span>ADMINISTRASI PENGGUNA & ROLE-BASED ACCESS CONTROL</span>
          </div>
          <h2 className="text-base font-bold text-slate-900">Manajemen Pengguna & Otorisasi Sistem</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengaturan akun, penugasan role (Admin, User, Viewer), sertifikasi tambang, dan status keaktifan akun
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Tambah Pengguna Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama, email, jabatan, role..."
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold text-slate-700">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & Email</th>
                <th className="py-3 px-4">Role Sistem</th>
                <th className="py-3 px-4">Departemen & Site</th>
                <th className="py-3 px-4">Jabatan & Lisensi Tambang</th>
                <th className="py-3 px-4">Status Akun</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{user.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                      user.role === 'USER' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-medium">{user.departmentName}</div>
                    <div className="text-[11px] text-slate-500">{user.siteName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-700">{user.position}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{user.phone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      user.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {user.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleUserActiveStatus(user.id)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${
                        user.isActive 
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Doni Firmansyah, S.T."
                  value={newUserForm.fullName}
                  onChange={e => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Perusahaan *</label>
                <input
                  type="email"
                  required
                  placeholder="doni.f@minerba-isms.com"
                  value={newUserForm.email}
                  onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kata Sandi Awal * (Min. 6 Karakter)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: user123"
                  value={newUserForm.password}
                  onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Sistem *</label>
                  <select
                    value={newUserForm.role}
                    onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white font-bold"
                  >
                    <option value="USER">USER (Operasional / Auditor)</option>
                    <option value="VIEWER">VIEWER (Read-Only)</option>
                    <option value="ADMIN">ADMIN (Full Access)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Departemen</label>
                  <select
                    value={newUserForm.departmentId}
                    onChange={e => setNewUserForm({ ...newUserForm, departmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Site Tambang</label>
                  <select
                    value={newUserForm.siteId}
                    onChange={e => setNewUserForm({ ...newUserForm, siteId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none bg-white"
                  >
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan & Lisensi Tambang</label>
                  <input
                    type="text"
                    placeholder="Mine Supervisor (POP)"
                    value={newUserForm.position}
                    onChange={e => setNewUserForm({ ...newUserForm, position: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Handphone</label>
                <input
                  type="text"
                  placeholder="+62 812-xxxx-xxxx"
                  value={newUserForm.phone}
                  onChange={e => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-700">
                  Batal
                </button>
                <button type="submit" className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg">
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
