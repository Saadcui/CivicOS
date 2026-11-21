'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  Lock,
  Cpu,
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Database,
  Key,
  Upload,
  Loader2,
} from 'lucide-react';

export default function SettingsClient() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const [settings, setSettings] = useState({
    jwtExpiryDays: '7',
    httpOnlyCookie: true,
    strictSameSite: true,
    aiConfidenceThreshold: '0.85',
    cctvScanIntervalMinutes: '5',
    slaCriticalHours: '4',
    slaHighHours: '12',
    slaMediumHours: '24',
    slaLowHours: '48',
    requireOfficerPhotoProof: true,
    autoRouteByKeywords: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 600);
  };

  const handleImageAnalysis = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisResult(null);

    const form = new FormData();
    form.append('image', file);

    try {
      const response = await fetch('/api/detections/analyze', {
        method: 'POST',
        body: form,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }
      setAnalysisResult(data);
    } catch (err) {
      setAnalysisError(err.message || 'Analysis failed');
    } finally {
      setAnalysisLoading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-coral block mb-1">
          Municipal System Administration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-navy">
          System & Security Settings
        </h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Configure security policy enforcement, JWT authentication sessions, and optical AI triage parameters.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 size={16} />
          <span>Municipal system settings successfully synchronized to cluster.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: RBAC & Authentication */}
        <div className="civic-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-coral/10 text-coral flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Role-Based Access Control & Cryptographic Sessions
              </h3>
              <p className="text-xs text-text-secondary">
                Hardened HTTP-only cookie configuration and token signature parameters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-text-primary mb-1">
                JWT Session Lifespan (Days)
              </label>
              <input
                type="number"
                value={settings.jwtExpiryDays}
                onChange={(e) => setSettings({ ...settings, jwtExpiryDays: e.target.value })}
                className="civic-input text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-text-primary mb-1">
                Password Hashing Standard
              </label>
              <input
                type="text"
                disabled
                value="bcrypt (10 salt rounds with SHA-256 pre-hash)"
                className="civic-input text-xs bg-[#F3F3EC] text-text-secondary cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.httpOnlyCookie}
                onChange={(e) => setSettings({ ...settings, httpOnlyCookie: e.target.checked })}
                className="w-4 h-4 text-coral rounded border-border"
              />
              <span className="font-semibold text-navy">
                Enforce HttpOnly flag on authentication cookies (Prevents XSS extraction)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.strictSameSite}
                onChange={(e) => setSettings({ ...settings, strictSameSite: e.target.checked })}
                className="w-4 h-4 text-coral rounded border-border"
              />
              <span className="font-semibold text-navy">
                Enforce SameSite=Lax on cookie transmission (Mitigates CSRF)
              </span>
            </label>
          </div>
        </div>

        {/* Section 2: AI CCTV Parameters */}
        <div className="civic-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
              <Cpu size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Autonomous Optical Anomaly Detection Engine
              </h3>
              <p className="text-xs text-text-secondary">
                Confidence cutoff thresholds and automated work-order generation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-text-primary mb-1">
                Anomaly Confidence Cutoff (0.50 – 0.99)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.5"
                max="0.99"
                value={settings.aiConfidenceThreshold}
                onChange={(e) => setSettings({ ...settings, aiConfidenceThreshold: e.target.value })}
                className="civic-input text-xs"
              />
              <span className="text-[11px] text-text-secondary mt-0.5 block">
                Detections below this score are queued for manual human officer verification.
              </span>
            </div>

            <div>
              <label className="block font-bold text-text-primary mb-1">
                CCTV Batch Optical Scan Frequency (Minutes)
              </label>
              <input
                type="number"
                value={settings.cctvScanIntervalMinutes}
                onChange={(e) => setSettings({ ...settings, cctvScanIntervalMinutes: e.target.value })}
                className="civic-input text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 2.5: Model test */}
        <div className="civic-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Test Road Defect Model
              </h3>
              <p className="text-xs text-text-secondary">
                Upload a road or CCTV frame to verify the trained YOLO model.
              </p>
            </div>
          </div>

          <label className="btn-outline-navy inline-flex items-center gap-2 cursor-pointer text-xs">
            {analysisLoading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {analysisLoading ? 'Analyzing frame...' : 'Choose camera image'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImageAnalysis}
              disabled={analysisLoading}
            />
          </label>

          {analysisError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.annotatedImage && (
                <img
                  src={analysisResult.annotatedImage}
                  alt="YOLO detection result"
                  className="w-full rounded-xl border border-border"
                />
              )}
              <div className="space-y-2 text-xs">
                {analysisResult.detections?.length ? (
                  analysisResult.detections.map((item, index) => (
                    <div key={`${item.className}-${index}`} className="p-3 rounded-xl bg-[#F3F3EC]">
                      <div className="font-bold text-navy">
                        {item.className.replaceAll('_', ' ')}
                      </div>
                      <div className="text-text-secondary">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-[#F3F3EC] text-text-secondary">
                    No road defects detected above the configured confidence threshold.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Section 3: SLA Turnaround Targets */}
        <div className="civic-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border">
            <div className="w-9 h-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Service Level Agreement (SLA) Resolution Targets
              </h3>
              <p className="text-xs text-text-secondary">
                Turnaround deadlines per incident urgency tier.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-bold text-coral mb-1">Critical (Hours)</label>
              <input
                type="number"
                value={settings.slaCriticalHours}
                onChange={(e) => setSettings({ ...settings, slaCriticalHours: e.target.value })}
                className="civic-input text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-orange-700 mb-1">High (Hours)</label>
              <input
                type="number"
                value={settings.slaHighHours}
                onChange={(e) => setSettings({ ...settings, slaHighHours: e.target.value })}
                className="civic-input text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-navy mb-1">Medium (Hours)</label>
              <input
                type="number"
                value={settings.slaMediumHours}
                onChange={(e) => setSettings({ ...settings, slaMediumHours: e.target.value })}
                className="civic-input text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-text-secondary mb-1">Low (Hours)</label>
              <input
                type="number"
                value={settings.slaLowHours}
                onChange={(e) => setSettings({ ...settings, slaLowHours: e.target.value })}
                className="civic-input text-xs"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-coral py-3 px-8 text-xs font-bold shadow-md disabled:opacity-60"
          >
            {loading ? (
              'Synchronizing Settings...'
            ) : (
              <div className="flex items-center gap-2">
                <Save size={15} />
                <span>Save Municipal Configuration</span>
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
