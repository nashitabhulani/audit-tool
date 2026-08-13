import { API_BASE } from '../config.js';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, CheckCircle, ShieldAlert, AlertTriangle, Play, Sparkles, RefreshCw } from 'lucide-react';
import EditableField from './EditableField';

export default function AuditReport({ deliverableId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [deliverableId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/deliverables/${deliverableId}`);
      if (!res.ok) throw new Error('Failed to load report.');
      const record = await res.json();
      setData(record);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Error reading deliverable details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedOutput) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ output_data: updatedOutput })
      });
      if (!res.ok) throw new Error('Database sync failed.');
      const record = await res.json();
      setData(record); // update with synced record
    } catch (err) {
      console.error(err);
      alert('Failed to auto-save edits. Please check database connection.');
    } finally {
      setSaving(false);
    }
  };

  // Generic state modifier path helpers
  const handleClientFieldChange = (field, newVal) => {
    const updatedOutput = { ...data.output_data, [field]: newVal };
    handleUpdate(updatedOutput);
  };

  const handleSectionScoreChange = (secIdx, newVal) => {
    const updatedSections = [...data.output_data.sections];
    updatedSections[secIdx] = { ...updatedSections[secIdx], score: newVal };
    
    // Re-calculate overall score dynamically as weighted average
    const total = updatedSections.reduce((acc, curr) => acc + (parseFloat(curr.score) || 0), 0);
    const avg = parseFloat((total / updatedSections.length).toFixed(1));

    const updatedOutput = { 
      ...data.output_data, 
      sections: updatedSections,
      overall_score: avg
    };
    handleUpdate(updatedOutput);
  };

  const handleFindingChange = (secIdx, findIdx, field, newVal) => {
    const updatedSections = [...data.output_data.sections];
    const updatedFindings = [...updatedSections[secIdx].findings];
    updatedFindings[findIdx] = { ...updatedFindings[findIdx], [field]: newVal };
    updatedSections[secIdx] = { ...updatedSections[secIdx], findings: updatedFindings };
    
    const updatedOutput = { ...data.output_data, sections: updatedSections };
    handleUpdate(updatedOutput);
  };

  const handleActionPlanItemChange = (category, itemIdx, newVal) => {
    const updatedPlan = { ...data.output_data.action_plan };
    const updatedItems = [...updatedPlan[category]];
    updatedItems[itemIdx] = newVal;
    updatedPlan[category] = updatedItems;
    
    const updatedOutput = { ...data.output_data, action_plan: updatedPlan };
    handleUpdate(updatedOutput);
  };

  const exportToPPTX = () => {
    // Navigate straight to download route
    window.open(`/api/deliverables/${deliverableId}/export`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <span className="text-slate-400 text-sm">Loading audit results...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <div className="p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-200 text-sm mb-6">
          {error || 'Record could not be loaded.'}
        </div>
        <button onClick={onBack} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold cursor-pointer">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { output_data: report } = data;
  const overallScore = report.overall_score || 0;
  const scoreColor = overallScore >= 8 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' : (overallScore >= 5 ? 'text-amber-400 border-amber-500/30 bg-amber-950/20' : 'text-red-400 border-red-500/30 bg-red-950/20');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </button>

        <div className="flex items-center gap-4">
          {saving ? (
            <span className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
              Syncing database...
            </span>
          ) : (
            <span className="text-emerald-400/80 text-xs font-semibold flex items-center gap-1">
              ✓ Autosaved to SQLite
            </span>
          )}

          <button
            onClick={exportToPPTX}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-xs tracking-wider uppercase transition-all shadow-lg hover:scale-[1.02] shadow-violet-900/20 text-white cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export PPTX
          </button>
        </div>
      </div>

      {/* Title Card */}
      <div className="p-6 mb-8 rounded-2xl glass-panel relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 text-[10px] tracking-widest font-extrabold uppercase">
              Module A // Audit
            </span>
            <div className="mt-2 text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <EditableField
                value={report.client_name}
                onChange={(val) => handleClientFieldChange('client_name', val)}
                className="text-2xl font-extrabold"
              />
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-sm mt-1">
              <span className="font-semibold text-slate-500">URL:</span>
              <EditableField
                value={report.url}
                onChange={(val) => handleClientFieldChange('url', val)}
                className="text-sm font-medium text-slate-300"
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider">Generated on</span>
            <span className="text-slate-300 font-semibold text-sm">
              {new Date(report.generated_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Score Metric & Roadmap */}
        <div className="space-y-8">
          
          {/* Score Visual Block */}
          <div className="p-6 rounded-2xl glass-panel text-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Overall Score</h3>
            
            <div className={`w-32 h-32 mx-auto rounded-full border-4 flex flex-col items-center justify-center ${scoreColor}`}>
              <span className="text-4xl font-extrabold tracking-tight">{overallScore}</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">out of 10</span>
            </div>
            
            <p className="text-slate-400 text-xs mt-6 leading-relaxed px-4">
              Calculated dynamically from the average score across all detailed audit categories below.
            </p>
          </div>

          {/* Action Roadmap Card */}
          <div className="p-6 rounded-2xl glass-panel">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-6">
              <CheckCircle className="w-4 h-4 text-violet-400" />
              Strategic Roadmap
            </h3>

            {/* Quick Wins */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3">Quick Wins (Short-term)</h4>
              <div className="space-y-2">
                {(report.action_plan?.quick_wins || []).map((win, idx) => (
                  <EditableField
                    key={idx}
                    value={win}
                    onChange={(val) => handleActionPlanItemChange('quick_wins', idx, val)}
                    isTextArea={true}
                    className="text-xs text-slate-300 bg-slate-950/20"
                  />
                ))}
              </div>
            </div>

            {/* Medium-term */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">Medium-Term Strategy</h4>
              <div className="space-y-2">
                {(report.action_plan?.medium_term || []).map((win, idx) => (
                  <EditableField
                    key={idx}
                    value={win}
                    onChange={(val) => handleActionPlanItemChange('medium_term', idx, val)}
                    isTextArea={true}
                    className="text-xs text-slate-300 bg-slate-950/20"
                  />
                ))}
              </div>
            </div>

            {/* Long-term */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Long-Term Vision</h4>
              <div className="space-y-2">
                {(report.action_plan?.long_term || []).map((win, idx) => (
                  <EditableField
                    key={idx}
                    value={win}
                    onChange={(val) => handleActionPlanItemChange('long_term', idx, val)}
                    isTextArea={true}
                    className="text-xs text-slate-300 bg-slate-950/20"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Audit Sections */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
            Detailed Audited Sections (Double click any item to edit)
          </h3>

          {(report.sections || []).map((sec, secIdx) => {
            const secScore = sec.score || 0;
            const secScoreColor = secScore >= 8 ? 'text-emerald-400 bg-emerald-950/30' : (secScore >= 5 ? 'text-amber-400 bg-amber-950/30' : 'text-red-400 bg-red-950/30');

            return (
              <div key={secIdx} className="p-6 rounded-2xl glass-panel">
                {/* Section Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/80">
                  <h4 className="text-base font-extrabold text-slate-200">
                    {sec.section_name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Score:</span>
                    <EditableField
                      value={sec.score}
                      type="number"
                      onChange={(val) => handleSectionScoreChange(secIdx, val)}
                      className={`text-sm font-extrabold px-3 py-1 rounded-lg ${secScoreColor}`}
                    />
                  </div>
                </div>

                {/* Findings Checklist */}
                <div className="space-y-6">
                  {(sec.findings || []).map((f, fIdx) => {
                    const sevColor = f.severity === 'high' ? 'bg-red-950/50 text-red-400 border-red-900/40' : (f.severity === 'medium' ? 'bg-amber-950/50 text-amber-400 border-amber-900/40' : 'bg-emerald-950/50 text-emerald-400 border-emerald-900/40');
                    const effortColor = f.effort_estimate === 'high' ? 'text-red-400 bg-red-950/20' : (f.effort_estimate === 'medium' ? 'text-amber-400 bg-amber-950/20' : 'text-emerald-400 bg-emerald-950/20');

                    return (
                      <div key={fIdx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50 space-y-3">
                        {/* Issue Title and Badges */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="font-bold text-slate-300 text-sm flex-1">
                            <EditableField
                              value={f.issue}
                              onChange={(val) => handleFindingChange(secIdx, fIdx, 'issue', val)}
                              className="font-bold text-slate-300 text-sm"
                            />
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {/* Severity pill */}
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Severity</span>
                              <EditableField
                                value={f.severity}
                                onChange={(val) => handleFindingChange(secIdx, fIdx, 'severity', val)}
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${sevColor}`}
                              />
                            </span>
                            
                            {/* Effort pill */}
                            <span className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase">Effort</span>
                              <EditableField
                                value={f.effort_estimate}
                                onChange={(val) => handleFindingChange(secIdx, fIdx, 'effort_estimate', val)}
                                className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border border-slate-700 ${effortColor}`}
                              />
                            </span>
                          </div>
                        </div>

                        {/* Impact Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Business/UX Impact</span>
                            <EditableField
                              value={f.impact}
                              onChange={(val) => handleFindingChange(secIdx, fIdx, 'impact', val)}
                              isTextArea={true}
                              className="text-xs text-slate-400"
                            />
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold tracking-wider text-slate-500 uppercase mb-1">Technical Recommendation</span>
                            <EditableField
                              value={f.recommendation}
                              onChange={(val) => handleFindingChange(secIdx, fIdx, 'recommendation', val)}
                              isTextArea={true}
                              className="text-xs text-slate-400"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
