import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { UserProfileModal } from './components/UserProfileModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { SupabaseSyncModal } from './components/SupabaseSyncModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentMappingPage } from './pages/DocumentMappingPage';
import { SMKPMasterPage } from './pages/SMKPMasterPage';
import { ISOMasterPage } from './pages/ISOMasterPage';
import { AuditsPage } from './pages/AuditsPage';
import { FindingsPage } from './pages/FindingsPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersManagementPage } from './pages/UsersManagementPage';

const MainLayout: React.FC = () => {
  const { currentUser, isAuthenticated } = useApp();

  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Global Modals
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const getModuleTitle = (mod: string): string => {
    switch (mod) {
      case 'dashboard': return 'Dashboard Eksekutif & Kinerja SHE';
      case 'documents': return 'Database Dokumen & SOP Terkendali';
      case 'mapping': return 'Pemetaan Dokumen & Gap Analysis';
      case 'smkp': return 'Master SMKP Minerba Kepdirjen 185';
      case 'iso': return 'Master Persyaratan ISO Terintegrasi';
      case 'audits': return 'Program, Jadwal & Checklist Audit';
      case 'findings': return 'Temuan Audit & Corrective Action (CAR)';
      case 'reports': return 'Pusat Laporan & Ekspor Dokumen';
      case 'logs': return 'Audit Trail & Matriks Hak Akses (RBAC)';
      case 'users': return 'Manajemen Pengguna & Otorisasi';
      default: return 'Integrated SHE Management System';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans antialiased text-slate-900">
      {/* Sidebar */}
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header 
          activeModuleTitle={getModuleTitle(activeModule)}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenImport={() => setShowImportModal(true)}
          onOpenSupabase={() => setShowSupabaseModal(true)}
          onNavigate={(mod) => setActiveModule(mod)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-12">
          <div className="max-w-7xl mx-auto">
            {activeModule === 'dashboard' && <DashboardPage onNavigate={(mod) => setActiveModule(mod)} />}
            {activeModule === 'documents' && <DocumentsPage />}
            {activeModule === 'mapping' && <DocumentMappingPage />}
            {activeModule === 'smkp' && <SMKPMasterPage />}
            {activeModule === 'iso' && <ISOMasterPage />}
            {activeModule === 'audits' && <AuditsPage />}
            {activeModule === 'findings' && <FindingsPage />}
            {activeModule === 'reports' && <ReportsPage />}
            {activeModule === 'logs' && <AuditLogsPage />}
            {activeModule === 'users' && <UsersManagementPage />}
          </div>
        </main>
      </div>

      {/* Profile & Security Modal */}
      <UserProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />

      {/* Supabase Cloud Database Sync Modal */}
      <SupabaseSyncModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;
