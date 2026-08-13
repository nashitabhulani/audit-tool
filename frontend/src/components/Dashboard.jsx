import { API_BASE } from '../config.js';
import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Calendar, Trash2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export default function Dashboard({ onCreateAudit, onCreatePreScoping, onViewDeliverable }) {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'audit', 'pre-scoping'

  // Fetch deliverables list on mount
  useEffect(() => {
    fetchDeliverables();
  }, []);

  const fetchDeliverables = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_BASE + '/api/deliverables');
      if (!res.ok) throw new Error('Failed to load history list.');
      const data = await res.json();
      setDeliverables(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to database server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering open
    if (!window.confirm('Are you sure you want to permanently delete this deliverable?')) return;

    try {
      const res = await fetch(`/api/deliverables/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete.');
      setDeliverables(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert('Error deleting: ' + err.message);
    }
  };

  const filteredItems = deliverables.filter(item => {
    const matchesSearch = item.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 p-6 glass-panel rounded-2xl glow-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="text-xs font-semibold tracking-wider text-violet-400 uppercase">Internal Console</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-50 via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Google Antigravity
          </h1>
          <p className="text-slate-400 text-sm mt-1">Client Scoping & Website Audit Automation Workspace</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onCreateAudit}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-semibold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-cyan-900/30 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Audit
          </button>
          <button
            onClick={onCreatePreScoping}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-semibold text-sm transition-all hover:scale-[1.02] shadow-lg shadow-violet-900/30 text-white cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Pre-Scoping
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Filter Type Toggles */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              filterType === 'all' ? 'bg-slate-800 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('audit')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              filterType === 'audit' ? 'bg-cyan-900/40 text-cyan-200 shadow-sm border border-cyan-800/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audits
          </button>
          <button
            onClick={() => setFilterType('pre-scoping')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              filterType === 'pre-scoping' ? 'bg-violet-900/40 text-violet-200 shadow-sm border border-violet-800/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-Scoping Decks
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-sm mb-8">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-4"></div>
          <span className="text-slate-400 text-sm font-medium">Scanning local SQLite database...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-24 glass-panel rounded-2xl border border-slate-800/50">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-300">No deliverables found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            {searchQuery ? "No matches found for that query." : "Get started by generating your first client site audit or discovery requirements scoping deck."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onViewDeliverable(item.id, item.type)}
              className="group relative flex flex-col justify-between p-6 rounded-2xl glass-panel hover:border-slate-600/50 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <div>
                {/* Header Row */}
                <div className="flex justify-between items-start gap-4 mb-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${
                    item.type === 'audit' 
                      ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-900/40' 
                      : 'bg-violet-950/50 text-violet-400 border border-violet-900/40'
                  }`}>
                    {item.type === 'audit' ? 'Website Audit' : 'Pre-Scoping'}
                  </span>

                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-950/20 transition-all cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Client Name */}
                <h3 className="text-lg font-bold text-slate-200 group-hover:text-violet-400 transition-colors line-clamp-1 mb-2">
                  {item.client_name}
                </h3>
                
                {/* Date */}
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-3">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Updated {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Footer action trigger */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                  Open report
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
