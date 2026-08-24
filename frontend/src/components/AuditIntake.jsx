import { API_BASE } from '../config.js';
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';

const LOADING_PHASES = [
  'Establishing secure API tunnel...',
  'Parsing intake form parameters...',
  'Injecting strategic heuristics engine...',
  'Synthesizing competitor positioning matrices...',
  'Scoring technical SEO and performance indicators...',
  'Formulating conversion-rate action items...',
  'Enforcing structural JSON schemas...',
  'Saving deliverable to local SQLite database...',
  'Finalizing website audit report...'
];

export default function AuditIntake({ onBack, onGenerateComplete }) {
  const [formData, setFormData] = useState({
    client_name: '',
    url: '',
    industry: '',
    project_goals: '',
    known_pain_points: '',
    comp1: '',
    comp2: '',
    comp3: '',
    depth: 'summary'
  });

  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState(null);

  // Stepper effect for loader
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase(prev => {
          if (prev < LOADING_PHASES.length - 1) return prev + 1;
          return prev;
        });
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_name.trim()) return setError('Client name is required.');
    if (!formData.url.trim()) return setError('Website URL is required.');
    if (!formData.project_goals.trim()) return setError('Project goals are required.');

    setError(null);
    setLoading(true);
    setLoadingPhase(0);

    const competitorArray = [formData.comp1, formData.comp2, formData.comp3]
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const payload = {
      type: 'audit',
      inputs: {
        client_name: formData.client_name,
        url: formData.url,
        industry: formData.industry,
        project_goals: formData.project_goals,
        known_pain_points: formData.known_pain_points,
        competitors: competitorArray,
        depth: formData.depth
      }
    };

    try {
      const res = await fetch(API_BASE + '/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate deliverable.');
      }
      if (data && data.id) {
        try {
          sessionStorage.setItem('deliverable_' + data.id, JSON.stringify(data));
        } catch (e) {}
      }
      onGenerateComplete(data.id);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Glowing rings */}
          <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border border-violet-500/20 rounded-full"></div>
          <div className="absolute inset-2 border-b-violet-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        
        <h2 className="text-xl font-bold tracking-wide text-slate-200">
          Generating Website Audit
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-medium animate-pulse min-h-[20px]">
          {LOADING_PHASES[loadingPhase]}
        </p>
        
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-8 max-w-sm mx-auto border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-violet-500 h-full transition-all duration-[3500ms]"
            style={{ width: `${((loadingPhase + 1) / LOADING_PHASES.length) * 100}%` }}
          ></div>
        </div>
        <p className="text-slate-500 text-xs mt-4">This usually takes between 30-90 seconds. Do not reload.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back to Dashboard */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-sm font-medium mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Form Container */}
      <div className="glass-panel p-8 rounded-2xl glow-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Audit Intake Form</h2>
            <p className="text-slate-400 text-xs mt-0.5">Define client site properties for strategic assessment</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-950/40 border border-red-900/50 text-red-200 text-xs mb-6">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Client Name & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Client Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                name="client_name"
                required
                placeholder="e.g. Acme Corp"
                value={formData.client_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Website URL <span className="text-cyan-400">*</span>
              </label>
              <input
                type="url"
                name="url"
                required
                placeholder="e.g. https://acme.com"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Row 2: Industry / Depth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Industry / Vertical <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="text"
                name="industry"
                placeholder="e.g. B2B SaaS, E-commerce, Healthcare"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Audit Depth
              </label>
              <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 gap-2">
                <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase cursor-pointer transition-all ${
                  formData.depth === 'summary' 
                    ? 'bg-cyan-900/40 text-cyan-200 border border-cyan-800/40' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="depth"
                    value="summary"
                    checked={formData.depth === 'summary'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Summary
                </label>
                <label className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase cursor-pointer transition-all ${
                  formData.depth === 'page-by-page' 
                    ? 'bg-cyan-900/40 text-cyan-200 border border-cyan-800/40' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}>
                  <input
                    type="radio"
                    name="depth"
                    value="page-by-page"
                    checked={formData.depth === 'page-by-page'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  Detailed
                </label>
              </div>
            </div>
          </div>

          {/* Project Goals */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Project Goals / Priorities <span className="text-cyan-400">*</span>
            </label>
            <textarea
              name="project_goals"
              required
              rows={3}
              placeholder="What is the client trying to achieve? (e.g. increase leads by 30%, clean up navigation, modern branding, speed up checkout...)"
              value={formData.project_goals}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            ></textarea>
          </div>

          {/* Known Pain Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Known Pain Points / Site Bugs <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              name="known_pain_points"
              rows={3}
              placeholder="Describe any existing performance bottlenecks, high bounce rate sections, or specific pages the client complains about..."
              value={formData.known_pain_points}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            ></textarea>
          </div>

          {/* Competitors */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Competitor Websites <span className="text-slate-500">(Optional, up to 3)</span>
            </label>
            <div className="space-y-3">
              <input
                type="url"
                name="comp1"
                placeholder="Competitor URL #1 (e.g., https://competitor-one.com)"
                value={formData.comp1}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
              <input
                type="url"
                name="comp2"
                placeholder="Competitor URL #2"
                value={formData.comp2}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
              <input
                type="url"
                name="comp3"
                placeholder="Competitor URL #3"
                value={formData.comp3}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.01] shadow-lg shadow-cyan-900/30 text-white cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Audit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
