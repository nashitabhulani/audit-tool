import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import AuditIntake from './components/AuditIntake';
import PreScopingIntake from './components/PreScopingIntake';
import AuditReport from './components/AuditReport';
import PreScopingReport from './components/PreScopingReport';
import { Sparkles, HelpCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'audit-intake', 'pre-scoping-intake', 'audit-report', 'pre-scoping-report'
  const [selectedId, setSelectedId] = useState(null);

  const handleViewDeliverable = (id, type) => {
    setSelectedId(id);
    setCurrentView(type === 'audit' ? 'audit-report' : 'pre-scoping-report');
  };

  const handleGenerateComplete = (id, type) => {
    setSelectedId(id);
    setCurrentView(type === 'audit' ? 'audit-report' : 'pre-scoping-report');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100">
      
      {/* Top Brand Navbar */}
      <header className="border-b border-slate-900 bg-slate-900/30 backdrop-blur-md sticky top-0 z-55">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            onClick={() => setCurrentView('dashboard')} 
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <span className="p-1 rounded bg-violet-600 group-hover:bg-violet-500 transition-all font-bold text-sm">🚀</span>
            <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-violet-200 to-cyan-200 bg-clip-text text-transparent">
              ANTIGRAVITY // TOOLKIT
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <span>MVP v1.0</span>
            <span className="h-4 w-px bg-slate-800"></span>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Documentation
            </a>
          </div>
        </div>
      </header>

      {/* Main Screen Router */}
      <main className="flex-grow py-6">
        {currentView === 'dashboard' && (
          <Dashboard
            onCreateAudit={() => setCurrentView('audit-intake')}
            onCreatePreScoping={() => setCurrentView('pre-scoping-intake')}
            onViewDeliverable={handleViewDeliverable}
          />
        )}

        {currentView === 'audit-intake' && (
          <AuditIntake
            onBack={() => setCurrentView('dashboard')}
            onGenerateComplete={(id) => handleGenerateComplete(id, 'audit')}
          />
        )}

        {currentView === 'pre-scoping-intake' && (
          <PreScopingIntake
            onBack={() => setCurrentView('dashboard')}
            onGenerateComplete={(id) => handleGenerateComplete(id, 'pre-scoping')}
          />
        )}

        {currentView === 'audit-report' && (
          <AuditReport
            deliverableId={selectedId}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'pre-scoping-report' && (
          <PreScopingReport
            deliverableId={selectedId}
            onBack={() => setCurrentView('dashboard')}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Google Antigravity. Internal Use Only.</span>
          <span className="flex items-center gap-1">
            Built with <Sparkles className="w-3 h-3 text-violet-500" /> by Antigravity AI build agent.
          </span>
        </div>
      </footer>

    </div>
  );
}
