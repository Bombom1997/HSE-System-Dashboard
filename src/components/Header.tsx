import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  User, 
  MapPin, 
  Building2, 
  ChevronDown, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  FileSpreadsheet,
  RotateCcw,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface HeaderProps {
  activeModuleTitle: string;
  onOpenProfile: () => void;
  onOpenImport: () => void;
  onOpenSupabase: () => void;
  onNavigate: (module: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeModuleTitle, 
  onOpenProfile, 
  onOpenImport,
  onOpenSupabase,
  onNavigate 
}) => {
  const { 
    currentUser, 
    switchUserRole, 
    logout, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications,
    sites, 
    departments, 
    selectedSiteFilter, 
    setSelectedSiteFilter, 
    selectedDeptFilter, 
    setSelectedDeptFilter,
    resetToDemoData,
    supabaseStatus 
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="bg-red-500/10 text-red-600 border border-red-500/20 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">ADMIN (FULL ACCESS)</span>;
      case 'USER':
        return <span className="bg-amber-500/10 text-amber-700 border border-amber-500/20 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">USER (OPERASIONAL / AUDITOR)</span>;
      case 'VIEWER':
        return <span className="bg-blue-500/10 text-blue-700 border border-blue-500/20 px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider">VIEWER (READ-ONLY)</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Active Module & Company Header */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PT SUMBER DAYA MINERAL NUSANTARA</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                ISMS Live System
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">{activeModuleTitle}</h1>
          </div>
        </div>

        {/* Center: Global Site & Department Filter */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select 
              value={selectedSiteFilter} 
              onChange={(e) => setSelectedSiteFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer outline-none text-slate-800"
            >
              <option value="all">Semua Site / Tambang</option>
              {sites.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
            <select 
              value={selectedDeptFilter} 
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer outline-none text-slate-800"
            >
              <option value="all">Semua Departemen</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions, RBAC Switcher, Notifications, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Quick RBAC Switcher Button for Instant RBAC Testing */}
          <div className="relative">
            <button 
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs transition"
              title="Ganti Peran untuk Menguji Hak Akses (RBAC)"
            >
              <span className="text-[11px] font-medium text-slate-500">Peran:</span>
              {getRoleBadge(currentUser.role)}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="px-2 py-1.5 border-b border-slate-100 font-semibold text-slate-700">
                  Uji Otorisasi Role (RBAC)
                </div>
                <div className="p-1 space-y-1">
                  <button 
                    onClick={() => { switchUserRole('ADMIN'); setShowRoleMenu(false); }}
                    className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 hover:bg-slate-50 transition ${currentUser.role === 'ADMIN' ? 'bg-red-50/50 border border-red-200' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-600">ADMINISTRATOR</span>
                      {currentUser.role === 'ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-red-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500">Akses penuh: master data, approval dokumen, verifikasi audit, manajemen user.</span>
                  </button>

                  <button 
                    onClick={() => { switchUserRole('USER'); setShowRoleMenu(false); }}
                    className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 hover:bg-slate-50 transition ${currentUser.role === 'USER' ? 'bg-amber-50/50 border border-amber-200' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-700">USER (OPERASIONAL)</span>
                      {currentUser.role === 'USER' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500">Pengajuan dokumen, pengisian checklist, pengunggahan bukti tindakan perbaikan (CAPA).</span>
                  </button>

                  <button 
                    onClick={() => { switchUserRole('VIEWER'); setShowRoleMenu(false); }}
                    className={`w-full text-left p-2 rounded-lg flex flex-col gap-0.5 hover:bg-slate-50 transition ${currentUser.role === 'VIEWER' ? 'bg-blue-50/50 border border-blue-200' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-700">VIEWER (BACA SAJA)</span>
                      {currentUser.role === 'VIEWER' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                    <span className="text-[11px] text-slate-500">Melihat SOP disetujui, membaca matriks, memantau ringkasan audit. Tanpa hak ubah.</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Supabase Cloud Connection & Sync Button */}
          <button
            onClick={onOpenSupabase}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shadow-2xs ${
              supabaseStatus?.connected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
            }`}
            title="Kelola & Sinkronisasi Database Supabase"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Supabase</span>
            <span className={`w-2 h-2 rounded-full ${supabaseStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          </button>

          {/* Import Master Excel Button */}
          {currentUser.role === 'ADMIN' && (
            <button
              onClick={onOpenImport}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
              title="Import Data Master dari Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Import Excel</span>
            </button>
          )}

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset database kembali ke data terverifikasi awal?')) {
                resetToDemoData();
              }
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            title="Reset Data Demo ke Versi Awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Notifikasi Sistem ISMS</span>
                  <button 
                    onClick={clearAllNotifications}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Tandai Semua Dibaca
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 py-1">
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkModule) {
                          onNavigate(n.linkModule);
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${!n.isRead ? 'bg-amber-50/40' : ''}`}
                    >
                      {n.type === 'danger' && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                      {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <div className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{n.timestamp}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 pl-2 border-l border-slate-200 hover:opacity-90 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {currentUser.fullName.split(' ')[0][0]}{currentUser.fullName.split(' ')[1]?.[0] || 'U'}
              </div>
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">{currentUser.fullName}</span>
                <span className="text-[10px] text-slate-500">{currentUser.departmentName.split(' ')[0]}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                <div className="p-2 border-b border-slate-100">
                  <div className="font-bold text-slate-800">{currentUser.fullName}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                  <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => { onOpenProfile(); setShowUserDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Profil Pengguna & Password</span>
                  </button>
                  <button 
                    onClick={() => { onNavigate('logs'); setShowUserDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Audit Log Aktivitas</span>
                  </button>
                  <button 
                    onClick={() => { logout(); setShowUserDropdown(false); }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Keluar Sistem (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
