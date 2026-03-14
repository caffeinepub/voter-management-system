import React, { useState } from 'react';
import { UserProfile } from '../backend';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import VoterList from '../pages/VoterList';
import VoterEntry from '../pages/VoterEntry';
import Analytics from '../pages/Analytics';
import TaskManagement from '../pages/TaskManagement';
import LabelPrinting from '../pages/LabelPrinting';

export type Page = 'dashboard' | 'voter-list' | 'voter-entry' | 'analytics' | 'tasks' | 'label-printing';

interface AppLayoutProps {
  userProfile: UserProfile;
}

export default function AppLayout({ userProfile }: AppLayoutProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'voter-list':
        return <VoterList onNavigate={setCurrentPage} />;
      case 'voter-entry':
        return <VoterEntry onSuccess={() => setCurrentPage('voter-list')} />;
      case 'analytics':
        return <Analytics />;
      case 'tasks':
        return <TaskManagement />;
      case 'label-printing':
        return <LabelPrinting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSidebarOpen(false);
          }}
          userProfile={userProfile}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-accent transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <img src="/assets/generated/voter-mgmt-logo.dim_128x128.png" alt="Logo" className="w-8 h-8 object-contain" />
          <span className="font-heading font-bold text-lg" style={{ color: 'var(--foreground)' }}>VoterMS</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
