import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';
import { 
  Github, 
  ArrowRight, 
  Layers, 
  Zap, 
  Key, 
  Check, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import ShinyText from '../reactbits/ShinyText/ShinyText';
import AutoDocLogo from '../common/AutoDocLogo';
import PreviewBanner from '../common/PreviewBanner';

const QUICK_REPOS = [
  { label: 'FastAPI', url: 'https://github.com/fastapi/fastapi' },
  { label: 'Zustand', url: 'https://github.com/pmndrs/zustand' },
  { label: 'Flask', url: 'https://github.com/pallets/flask' },
  { label: 'Algo-Visualizer', url: 'https://github.com/bryanthomaas/Algo-Visualizer' },
];

export default function HeroInput({ onSubmit, loading }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [depth, setDepth] = useState('in-depth'); // 'quick' | 'in-depth'
  const [apiKey, setApiKey] = useState(() => {
    try {
      const stored = localStorage.getItem('user_gemini_api_key');
      return stored ? stored.trim().replace(/\s+/g, '') : '';
    } catch {
      return '';
    }
  });
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [serverConfigured, setServerConfigured] = useState(false);
  const [error, setError] = useState(null);

  const keyInputContainerRef = useRef(null);

  const hasValidKey = Boolean(apiKey && apiKey.trim().length > 0);

  useEffect(() => {
    axios.get('/api/health')
      .then(res => {
        if (res.data?.gemini_configured) {
          setServerConfigured(true);
        }
      })
      .catch(() => {});
  }, []);

  // GSAP animation when key input toggles open/closed
  useEffect(() => {
    if (!keyInputContainerRef.current) return;
    if (showKeyInput) {
      gsap.fromTo(
        keyInputContainerRef.current,
        { height: 0, autoAlpha: 0, y: -8 },
        { height: 'auto', autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [showKeyInput]);

  const handleApiKeyChange = (val) => {
    const sanitized = typeof val === 'string' ? val.trim().replace(/\s+/g, '') : '';
    setApiKey(sanitized);
    try {
      if (sanitized) {
        localStorage.setItem('user_gemini_api_key', sanitized);
      } else {
        localStorage.removeItem('user_gemini_api_key');
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for API key persistence', e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = repoUrl.trim();
    if (!trimmed) {
      setError('Please enter a GitHub repository URL.');
      return;
    }

    const sanitized = trimmed
      .replace(/[?#].*$/, '')
      .replace(/\/(tree|blob)\/.*$/, '');

    const GITHUB_REGEX = /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/i;

    if (!GITHUB_REGEX.test(sanitized)) {
      setError('Please enter a valid public GitHub URL (e.g., https://github.com/owner/repo)');
      return;
    }

    onSubmit({ 
      repoUrl: sanitized, 
      depth,
      apiKey: apiKey.trim() || null
    });
  };

  const scrollToGuide = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
      {/* Fraunces Display Heading */}
      <h1 data-animate="hero-title" className="text-4xl sm:text-5xl md:text-6xl font-semibold font-display tracking-tight mb-3 text-[#FEFDFE]">
        <ShinyText
          text="Autonomous Codebase Documenter"
          color="#FEFDFE"
          shineColor="#FEFDFE"
          speed={6}
          disabled={true}
          className="text-4xl sm:text-5xl md:text-6xl font-semibold font-display tracking-tight"
        />
      </h1>

      <p className="text-base sm:text-lg text-[#E4EBFE] max-w-2xl mb-5 leading-relaxed font-sans">
        Generate architecture diagrams, module breakdowns, and exportable Markdown bundles from any public GitHub repository
      </p>

      {/* Structural Heuristic Preview Banner when in preview mode */}
      <PreviewBanner 
        apiKey={apiKey} 
        serverConfigured={serverConfigured} 
        onConfigureKey={() => setShowKeyInput(true)} 
        className="mb-4 w-full text-left" 
      />

      {/* Main Input Form Panel */}
      <form data-animate="hero-form" onSubmit={handleSubmit} className="w-full svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 bg-[#012EA8]">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Github className="w-4 h-4 text-[#B2C6FA]" />
            </div>
            <input
              type="url"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://github.com/owner/repository"
              className="w-full pl-10 pr-4 py-3.5 rounded-lg ocean-input border border-[#FEFDFE]/20 text-white text-[#FEFDFE] placeholder-[#B2C6FA] text-sm font-sans focus:outline-none focus:ring-1 focus:ring-[#C7FC02] transition-colors bg-ocean-deep bg-[#012487]"
              required
              autoComplete="off"
              spellCheck="false"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-royal-shine px-6 py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50 font-sans"
          >
            <span>Generate Documentation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Controls Bar: Scope Switch, Quick Samples & API Key */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#FEFDFE]/15 text-xs font-sans">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#B2C6FA] font-medium">Scope</span>
              <div className="flex items-center gap-1 bg-[#012487] p-1 rounded-md border border-[#FEFDFE]/15">
                <button
                  type="button"
                  onClick={() => setDepth('quick')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    depth === 'quick'
                      ? 'bg-[#C7FC02] text-[#011650] font-semibold'
                      : 'text-[#E4EBFE] hover:text-[#FEFDFE] hover:bg-[#FEFDFE]/10'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDepth('in-depth')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                    depth === 'in-depth'
                      ? 'bg-[#C7FC02] text-[#011650] font-semibold'
                      : 'text-[#E4EBFE] hover:text-[#FEFDFE] hover:bg-[#FEFDFE]/10'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>In-Depth</span>
                </button>
              </div>
            </div>

            {/* Quick-Try Sample Repositories inline */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-[#B2C6FA]">Samples:</span>
              {QUICK_REPOS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => setRepoUrl(sample.url)}
                  className="text-xs px-2.5 py-1 rounded bg-[#012487] hover:bg-white/10 hover:bg-[#C7FC02] text-[#FEFDFE] hover:text-[#011650] border border-[#FEFDFE]/15 hover:border-[#C7FC02] transition-colors font-sans font-medium"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini Key Status & Toggle */}
          <div className="flex items-center gap-2">
            {serverConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#012487] text-[#C7FC02] border border-[#C7FC02]/40 text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Gemini Active</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-medium transition-colors ${
                  hasValidKey 
                    ? 'bg-[#012487] text-[#C7FC02] border-[#C7FC02]/50' 
                    : 'bg-[#012487] text-[#FEFDFE] border-[#FEFDFE]/20 hover:border-[#C7FC02]'
                }`}
              >
                {hasValidKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#C7FC02]" />
                    <span>Custom Key Saved</span>
                  </>
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>Add Gemini Key</span>
                  </>
                )}
                {showKeyInput ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Collapsible API Key Input */}
        {showKeyInput && (
          <div ref={keyInputContainerRef} className="mt-3 pt-3 border-t border-[#FEFDFE]/15 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <Key className="w-3.5 h-3.5 text-[#B2C6FA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="Paste Gemini API key (saved locally in browser)"
                  className="w-full pl-9 pr-3 py-2 rounded-lg ocean-input border border-[#FEFDFE]/20 text-xs text-[#FEFDFE] placeholder-[#B2C6FA] font-mono focus:outline-none bg-[#012487]"
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => handleApiKeyChange('')}
                  className="text-xs text-[#B2C6FA] hover:text-[#FEFDFE] px-2.5 py-1.5 rounded border border-[#FEFDFE]/15 whitespace-nowrap font-sans"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-[#FF6B6B] text-left font-medium font-sans">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
