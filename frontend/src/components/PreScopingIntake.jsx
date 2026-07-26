import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

const LOADING_PHASES = [
  'Decrypting discovery call transcripts...',
  'Extracting digital business constraints...',
  'Compiling information architecture models...',
  'Benchmarking competitor template scopes...',
  'Drafting functional page requirements...',
  'Mapping conversion-focused user journeys...',
  'Formulating hosting & database topologies...',
  'Filing content matrix responsibilities...',
  'Saving pre-scoping configuration to SQLite...',
  'Assembling deck specification schema...'
];

export default function PreScopingIntake({ onBack, onGenerateComplete }) {
  const [formData, setFormData] = useState({
    client_name: '',
    url: '',
    comp1: '',
    comp2: '',
    comp3: '',
    comp4: '',
    discovery_notes: '',
    page_count_types: '',
    platform_constraint: 'Not decided'
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
    if (!formData.discovery_notes.trim()) return setError('Discovery call notes are required.');

    setError(null);
    setLoading(true);
    setLoadingPhase(0);

    const competitorArray = [formData.comp1, formData.comp2, formData.comp3, formData.comp4]
      .map(url => url.trim())
      .filter(url => url.length > 0);

    const payload = {
      type: 'pre-scoping',
      inputs: {
        client_name: formData.client_name,
        url: formData.url,
        competitors: competitorArray,
        discovery_notes: formData.discovery_notes,
        page_count_types: formData.page_count_types,
        platform_constraint: formData.platform_constraint
      }
    };

    try {
      const res = await fetch('/api/deliverables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate pre-scoping deliverable.');
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
          <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-violet-400 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border border-cyan-500/20 rounded-full"></div>
          <div className="absolute inset-2 border-b-cyan-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
          <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-violet-400 animate-pulse" />
        </div>
        
        <h2 className="text-xl font-bold tracking-wide text-slate-200">
          Generating Pre-Scoping Deck
        </h2>
        <p className="text-slate-400 text-sm mt-2 font-medium animate-pulse min-h-[20px]">
          {LOADING_PHASES[loadingPhase]}
        </p>
        
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-8 max-w-sm mx-auto border border-slate-800">
          <div 
            className="bg-gradient-to-r from-violet-500 to-cyan-500 h-full transition-all duration-[3500ms]"
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
          <div className="p-2.5 rounded-xl bg-violet-950/50 border border-violet-800/40 text-violet-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Discovery Pre-Scoping Form</h2>
            <p className="text-slate-400 text-xs mt-0.5">Parse discovery call notes into product requirement decks</p>
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
                Client Name <span className="text-violet-400">*</span>
              </label>
              <input
                type="text"
                name="client_name"
                required
                placeholder="e.g. Stark Industries"
                value={formData.client_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Website URL <span className="text-slate-500">(Optional)</span>
              </label>
              <input
                type="url"
                name="url"
                placeholder="e.g. https://starkindustries.com"
                value={formData.url}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Row 2: Platform constraint */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Platform CMS Constraint
            </label>
            <select
              name="platform_constraint"
              value={formData.platform_constraint}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm cursor-pointer"
            >
              <option value="Not decided">Not decided / Recommendation needed</option>
              <option value="WordPress">WordPress</option>
              <option value="Shopify">Shopify</option>
              <option value="Webflow">Webflow</option>
              <option value="Next.js">Next.js</option>
              <option value="Other">Other CMS</option>
            </select>
          </div>

          {/* Discovery Call Notes (Large Textarea) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Discovery Call Notes / Call Transcription <span className="text-violet-400">*</span>
            </label>
            <textarea
              name="discovery_notes"
              required
              rows={8}
              placeholder="Paste raw scoping conversation notes, transcripts, or notes from discovery here. The AI will parse this to structure sitemaps, templates, features, user flows, and tech requirements..."
              value={formData.discovery_notes}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-y"
            ></textarea>
          </div>

          {/* Known Page Count / Page Types */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Known Page Count & Page Types <span className="text-slate-500">(Optional)</span>
            </label>
            <textarea
              name="page_count_types"
              rows={3}
              placeholder="e.g. Around 15 pages: Home, About, 4 Services, 5 Portfolio items, News Hub, Careers, Contact..."
              value={formData.page_count_types}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-sm resize-none"
            ></textarea>
          </div>

          {/* Competitors (2 to 4) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Competitor Websites <span className="text-slate-500">(Optional, up to 4)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="url"
                name="comp1"
                placeholder="Competitor URL #1"
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
              <input
                type="url"
                name="comp4"
                placeholder="Competitor URL #4"
                value={formData.comp4}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
              />
            </div>
          </div>

          {/* Generate Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.01] shadow-lg shadow-violet-900/30 text-white cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Generate Pre-Scoping Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
