import { API_BASE } from '../config.js';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Layers, Compass, Cpu, FileSpreadsheet, Users, HardDrive, ListCollapse } from 'lucide-react';
import EditableField from './EditableField';

const TABS = [
  { id: 'competitors', label: 'Competitors', icon: Users },
  { id: 'requirements', label: 'Actionable Reqs', icon: ListCollapse },
  { id: 'sitemap', label: 'Sitemap / IA', icon: Compass },
  { id: 'features', label: 'Page Features', icon: Layers },
  { id: 'forms', label: 'Forms & Journeys', icon: Compass },
  { id: 'technical', label: 'Tech Specifications', icon: Cpu },
  { id: 'content', label: 'Content Ownership', icon: FileSpreadsheet }
];

export default function PreScopingReport({ deliverableId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('competitors');

  useEffect(() => {
    fetchReport();
  }, [deliverableId]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const cached = sessionStorage.getItem('deliverable_' + deliverableId);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.id === deliverableId || parsed.id)) {
            setData(parsed);
            setError(null);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      const res = await fetch(API_BASE + `/api/deliverables/${deliverableId}`);
      if (!res.ok) throw new Error('Failed to load pre-scoping report.');
      const record = await res.json();
      setData(record);
      try {
        sessionStorage.setItem('deliverable_' + deliverableId, JSON.stringify(record));
      } catch (e) {}
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
      setData(record);
    } catch (err) {
      console.error(err);
      alert('Failed to auto-save edits.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (path, newVal) => {
    const updatedOutput = { ...data.output_data };
    
    // Traverses nested object to mutate value safely
    let current = updatedOutput;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = newVal;

    handleUpdate(updatedOutput);
  };

  const exportToPPTX = () => {
    window.open(`/api/deliverables/${deliverableId}/export`, '_blank');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
        <span className="text-slate-400 text-sm">Loading discovery deck results...</span>
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
        <div className="absolute right-0 top-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-2.5 py-0.5 rounded bg-violet-950/60 border border-violet-800/40 text-violet-400 text-[10px] tracking-widest font-extrabold uppercase">
              Module B // Pre-Scoping
            </span>
            <div className="mt-2 text-2xl font-extrabold text-slate-100 flex items-center gap-2">
              <EditableField
                value={report.client_name}
                onChange={(val) => handleFieldChange(['client_name'], val)}
                className="text-2xl font-extrabold"
              />
            </div>
            <p className="text-slate-400 text-xs mt-1">Structured design constraints and product requirements specifications.</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-slate-500 text-xs font-bold block uppercase tracking-wider">Generated on</span>
            <span className="text-slate-300 font-semibold text-sm">
              {new Date(report.generated_at || data.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </span>
          </div>
        </div>
      </div>

      {/* Tabbed Workspace Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Navigation Tabs */}
        <div className="md:col-span-1 space-y-1 bg-slate-900/60 p-2 rounded-2xl border border-slate-800/80">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-violet-600 text-slate-50 shadow-md shadow-violet-900/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side: Tab Panel Content */}
        <div className="md:col-span-3 min-h-[500px]">
          
          {/* TAB 1: COMPETITOR BENCHMARKING */}
          {activeTab === 'competitors' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-2">Competitor Analysis Matrix</h3>
              {(report.competitor_analysis || []).map((comp, idx) => (
                <div key={idx} className="p-6 rounded-2xl glass-panel space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                    <EditableField
                      value={comp.competitor_name}
                      onChange={(val) => handleFieldChange(['competitor_analysis', idx, 'competitor_name'], val)}
                      className="text-base font-extrabold text-violet-400"
                    />
                    <EditableField
                      value={comp.url}
                      onChange={(val) => handleFieldChange(['competitor_analysis', idx, 'url'], val)}
                      className="text-xs text-slate-500 font-medium"
                    />
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Observation</span>
                      <EditableField
                        value={comp.observation}
                        onChange={(val) => handleFieldChange(['competitor_analysis', idx, 'observation'], val)}
                        isTextArea={true}
                        className="text-slate-300"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Key Findings</span>
                      <div className="space-y-2">
                        {(comp.key_findings || []).map((find, fIdx) => (
                          <EditableField
                            key={fIdx}
                            value={find}
                            onChange={(val) => {
                              const updatedFindings = [...comp.key_findings];
                              updatedFindings[fIdx] = val;
                              handleFieldChange(['competitor_analysis', idx, 'key_findings'], updatedFindings);
                            }}
                            className="text-slate-300 bg-slate-950/20"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Strategic Takeaway</span>
                      <EditableField
                        value={comp.key_takeaway}
                        onChange={(val) => handleFieldChange(['competitor_analysis', idx, 'key_takeaway'], val)}
                        isTextArea={true}
                        className="text-slate-300 font-medium italic text-violet-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ACTIONABLE REQUIREMENTS */}
          {activeTab === 'requirements' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Actionable Requirements Map</h3>
              <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
                <div className="grid grid-cols-3 bg-slate-900/80 p-4 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <div>Category</div>
                  <div>Observation</div>
                  <div>Specification Requirement</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {(report.actionable_requirements || []).map((req, idx) => (
                    <div key={idx} className="grid grid-cols-3 p-4 items-start gap-4 text-xs">
                      <EditableField
                        value={req.category}
                        onChange={(val) => handleFieldChange(['actionable_requirements', idx, 'category'], val)}
                        className="font-bold text-violet-400"
                      />
                      <EditableField
                        value={req.finding}
                        onChange={(val) => handleFieldChange(['actionable_requirements', idx, 'finding'], val)}
                        isTextArea={true}
                        className="text-slate-300"
                      />
                      <EditableField
                        value={req.requirement}
                        onChange={(val) => handleFieldChange(['actionable_requirements', idx, 'requirement'], val)}
                        isTextArea={true}
                        className="text-slate-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SITEMAP & INFORMATION ARCHITECTURE */}
          {activeTab === 'sitemap' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Information Architecture</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Primary navigation */}
                <div className="p-6 rounded-2xl glass-panel space-y-4">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest border-b border-slate-800 pb-2">Primary Sitemap Navigation</h4>
                  <div className="space-y-2">
                    {(report.information_architecture?.primary_pages || []).map((page, idx) => (
                      <EditableField
                        key={idx}
                        value={page}
                        onChange={(val) => {
                          const updated = [...report.information_architecture.primary_pages];
                          updated[idx] = val;
                          handleFieldChange(['information_architecture', 'primary_pages'], updated);
                        }}
                        className="text-xs font-semibold text-slate-300"
                      />
                    ))}
                  </div>
                </div>

                {/* Templates and dynamic pages */}
                <div className="space-y-6">
                  {/* Templates */}
                  <div className="p-6 rounded-2xl glass-panel space-y-4">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">Template-Based Page Structures</h4>
                    <div className="space-y-3">
                      {(report.information_architecture?.template_based_pages || []).map((tpl, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-xs">
                          <EditableField
                            value={tpl.template_type}
                            onChange={(val) => handleFieldChange(['information_architecture', 'template_based_pages', idx, 'template_type'], val)}
                            className="font-bold text-slate-200 shrink-0"
                          />
                          <span className="text-slate-500">:</span>
                          <EditableField
                            value={tpl.usage}
                            onChange={(val) => handleFieldChange(['information_architecture', 'template_based_pages', idx, 'usage'], val)}
                            className="text-slate-400 w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic pages */}
                  <div className="p-6 rounded-2xl glass-panel space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Dynamic Archives / Feeds</h4>
                    <div className="space-y-2">
                      {(report.information_architecture?.dynamic_pages || []).map((page, idx) => (
                        <EditableField
                          key={idx}
                          value={page}
                          onChange={(val) => {
                            const updated = [...report.information_architecture.dynamic_pages];
                            updated[idx] = val;
                            handleFieldChange(['information_architecture', 'dynamic_pages'], updated);
                          }}
                          className="text-xs text-slate-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAGE FEATURE REQUIREMENTS */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Scoped Page Features</h3>
              
              {(report.feature_requirements || []).map((sec, secIdx) => (
                <div key={secIdx} className="p-6 rounded-2xl glass-panel space-y-4">
                  <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                    <EditableField
                      value={sec.page_type}
                      onChange={(val) => handleFieldChange(['feature_requirements', secIdx, 'page_type'], val)}
                      className="text-sm font-extrabold text-slate-100"
                    />
                  </div>
                  
                  <div className="divide-y divide-slate-800/60">
                    {(sec.features || []).map((feat, featIdx) => (
                      <div key={featIdx} className="py-3 flex flex-wrap md:flex-nowrap items-start justify-between gap-4 text-xs">
                        <div className="flex-1 space-y-1 pr-6">
                          <EditableField
                            value={feat.feature}
                            onChange={(val) => handleFieldChange(['feature_requirements', secIdx, 'features', featIdx, 'feature'], val)}
                            className="font-bold text-violet-400"
                          />
                          <EditableField
                            value={feat.description}
                            onChange={(val) => handleFieldChange(['feature_requirements', secIdx, 'features', featIdx, 'description'], val)}
                            isTextArea={true}
                            className="text-slate-400"
                          />
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Mandatory:</span>
                          <button
                            onClick={() => handleFieldChange(['feature_requirements', secIdx, 'features', featIdx, 'mandatory'], !feat.mandatory)}
                            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all border ${
                              feat.mandatory 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                                : 'bg-slate-900/60 text-slate-500 border-slate-800'
                            }`}
                          >
                            {feat.mandatory ? 'YES' : 'NO (V2)'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 5: FORMS & USER CONVERSION JOURNEYS */}
          {activeTab === 'forms' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Forms and Conversion Journeys</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form fields config */}
                <div className="p-6 rounded-2xl glass-panel space-y-6">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest border-b border-slate-800 pb-2">Lead / Intake Forms</h4>
                  
                  {(report.forms_and_journeys?.forms || []).map((form, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-2 text-xs">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Form Name</span>
                        <EditableField
                          value={form.form_name}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'forms', idx, 'form_name'], val)}
                          className="font-bold text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Trigger page / Entry location</span>
                        <EditableField
                          value={form.trigger_page}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'forms', idx, 'trigger_page'], val)}
                          className="text-slate-300"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Form fields mapping</span>
                        <div className="space-y-1.5">
                          {(form.fields || []).map((fld, fldIdx) => (
                            <EditableField
                              key={fldIdx}
                              value={fld}
                              onChange={(val) => {
                                const updatedFields = [...form.fields];
                                updatedFields[fldIdx] = val;
                                handleFieldChange(['forms_and_journeys', 'forms', idx, 'fields'], updatedFields);
                              }}
                              className="text-xs text-slate-400 bg-slate-950/20"
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Post-Submission Action</span>
                        <EditableField
                          value={form.post_submission_action}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'forms', idx, 'post_submission_action'], val)}
                          className="text-slate-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* User journeys mappings */}
                <div className="p-6 rounded-2xl glass-panel space-y-6">
                  <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest border-b border-slate-800 pb-2">Critical User Navigation Journeys</h4>
                  
                  {(report.forms_and_journeys?.user_journeys || []).map((jn, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 space-y-3 text-xs">
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">User Persona Type</span>
                        <EditableField
                          value={jn.user_type}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'user_journeys', idx, 'user_type'], val)}
                          className="font-bold text-slate-200"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Traffic Entry Point</span>
                        <EditableField
                          value={jn.entry_point}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'user_journeys', idx, 'entry_point'], val)}
                          className="text-slate-300"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Navigation Path Steps</span>
                        <EditableField
                          value={jn.action}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'user_journeys', idx, 'action'], val)}
                          isTextArea={true}
                          className="text-slate-300"
                        />
                      </div>
                      <div>
                        <span className="block text-[9px] font-bold text-slate-500 uppercase">Journey Outcome</span>
                        <EditableField
                          value={jn.outcome}
                          onChange={(val) => handleFieldChange(['forms_and_journeys', 'user_journeys', idx, 'outcome'], val)}
                          isTextArea={true}
                          className="text-violet-300 font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TECHNICAL SPECIFICATIONS */}
          {activeTab === 'technical' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Technical Requirements</h3>
              
              <div className="p-6 rounded-2xl glass-panel space-y-6 text-sm divide-y divide-slate-850">
                <div className="pb-4">
                  <span className="block text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Platform CMS Recommendation</span>
                  <EditableField
                    value={report.technical_requirements?.platform_cms}
                    onChange={(val) => handleFieldChange(['technical_requirements', 'platform_cms'], val)}
                    isTextArea={true}
                    className="text-slate-300"
                  />
                </div>

                <div className="py-4">
                  <span className="block text-xs font-bold text-violet-400 uppercase tracking-wider mb-2">Theme & CSS Development Style</span>
                  <EditableField
                    value={report.technical_requirements?.theme_structure}
                    onChange={(val) => handleFieldChange(['technical_requirements', 'theme_structure'], val)}
                    isTextArea={true}
                    className="text-slate-300"
                  />
                </div>

                <div className="py-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Recommended Infrastructure Hosting</span>
                  <EditableField
                    value={report.technical_requirements?.hosting}
                    onChange={(val) => handleFieldChange(['technical_requirements', 'hosting'], val)}
                    isTextArea={true}
                    className="text-slate-300"
                  />
                </div>

                <div className="py-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Speed Performance Hardening</span>
                  <EditableField
                    value={report.technical_requirements?.performance}
                    onChange={(val) => handleFieldChange(['technical_requirements', 'performance'], val)}
                    isTextArea={true}
                    className="text-slate-300"
                  />
                </div>

                <div className="pt-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">SSL and Core Security Standards</span>
                  <EditableField
                    value={report.technical_requirements?.security}
                    onChange={(val) => handleFieldChange(['technical_requirements', 'security'], val)}
                    isTextArea={true}
                    className="text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: CONTENT RESOURCE OWNERSHIP MATRIX */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Content Ownership Matrix</h3>
              
              <div className="rounded-2xl glass-panel overflow-hidden border border-slate-800">
                <div className="grid grid-cols-4 bg-slate-900/80 p-4 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <div>Content Section</div>
                  <div>Details Scoped</div>
                  <div>Source State</div>
                  <div>Responsibility</div>
                </div>
                
                <div className="divide-y divide-slate-800">
                  {(report.content_ownership || []).map((row, idx) => (
                    <div key={idx} className="grid grid-cols-4 p-4 items-center gap-4 text-xs">
                      <EditableField
                        value={row.section}
                        onChange={(val) => handleFieldChange(['content_ownership', idx, 'section'], val)}
                        className="font-bold text-violet-400"
                      />
                      <EditableField
                        value={row.content_required}
                        onChange={(val) => handleFieldChange(['content_ownership', idx, 'content_required'], val)}
                        isTextArea={true}
                        className="text-slate-300 animate-none"
                      />
                      
                      {/* Source state toggle */}
                      <div>
                        <button
                          onClick={() => handleFieldChange(['content_ownership', idx, 'source'], row.source === 'Existing' ? 'New' : 'Existing')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wider uppercase transition-all ${
                            row.source === 'Existing' 
                              ? 'bg-slate-900 border border-slate-800 text-slate-400' 
                              : 'bg-cyan-950/40 border border-cyan-900/30 text-cyan-400'
                          }`}
                        >
                          {row.source}
                        </button>
                      </div>

                      {/* Responsibility toggle */}
                      <div>
                        <button
                          onClick={() => handleFieldChange(['content_ownership', idx, 'responsibility'], row.responsibility === 'Client' ? 'Agency' : 'Client')}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[10px] tracking-wider uppercase transition-all ${
                            row.responsibility === 'Client' 
                              ? 'bg-amber-950/40 border border-amber-900/30 text-amber-400' 
                              : 'bg-violet-950/40 border border-violet-900/30 text-violet-400'
                          }`}
                        >
                          {row.responsibility}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
