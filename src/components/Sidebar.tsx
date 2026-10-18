import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Network, 
  HardHat, 
  Award, 
  ClipboardCheck, 
  AlertOctagon, 
  BarChart3, 
  History, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  ShieldAlert,
  BookOpen
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (mod: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  collapsed, 
  setCollapsed 
}) => {
  const { currentUser, documents, findings, audits } = useApp();

  const openFindingsCount = findings.filter(f => f.status === 'Open' || f.status === 'In Progress' || f.status === 'Pending Verification').length;
  const inReviewDocsCount = documents.filter(d => d.status === 'Submitted' || d.status === 'Under Review' || d.status === 'Revision Required').length;

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Eksekutif',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'documents',
      label: 'Database Dokumen & SOP',
      icon: FileText,
      badge: inReviewDocsCount > 0 ? `${inReviewDocsCount} review` : null,
      badgeColor: 'bg-amber-500'
    },
    {
      id: 'mapping',
      label: 'Pemetaan Matriks Kepatuhan',
      icon: Network,
      badge: null
    },
    {
      id: 'smkp',
      label: 'Master SMKP Minerba',
      icon: HardHat,
      badge: 'Kepdirjen 185'
    },
    {
      id: 'iso',
      label: 'Master ISO Terintegrasi',
      icon: Award,
      badge: '9001/14001/45001'
    },
    {
      id: 'audits',
      label: 'Program & Checklist Audit',
      icon: ClipboardCheck,
      badge: audits.length.toString()
    },
    {
      id: 'findings',
      label: 'Temuan & Corrective Action (CAR)',
      icon: AlertOctagon,
      badge: openFindingsCount > 0 ? `${openFindingsCount} open` : null,
      badgeColor: 'bg-red-500'
    },
    {
      id: 'reports',
      label: 'Laporan & Ekspor Dokumen',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'logs',
      label: 'Audit Log & Matrix RBAC',
      icon: History,
      badge: null
    },
  ];

  // Admin exclusive user management menu
  if (currentUser.role === 'ADMIN') {
    menuItems.push({
      id: 'users',
      label: 'Manajemen Pengguna & Role',
      icon: Users,
      badge: 'Admin'
    });
  }

  return (
    <aside 
      className={`bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 z-40 relative shadow-xl border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-white">ISMS MINERBA</span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider">SHE & AUDIT SYSTEM</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        )}

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition hidden lg:block"
          title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition group cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20' 
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
              
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate text-left">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      isActive 
                        ? 'bg-slate-950 text-amber-300' 
                        : item.badgeColor ? `${item.badgeColor} text-white` : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info Box */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>Standar Terintegrasi</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Kepdirjen 185.K/37.04/DJB/2019 & ISO 9001/14001/45001 Terverifikasi.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Status Server: Aktif</span>
              <span className="text-emerald-400">Online 100%</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
