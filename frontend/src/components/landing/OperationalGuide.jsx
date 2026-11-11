import React from 'react';
import { ShieldCheck, Key, BookOpen, Check } from 'lucide-react';

export default function OperationalGuide({ onConfigureKey }) {
  return (
    <section data-animate="operational-guide" className="w-full">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#FEFDFE]/15 pb-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#FEFDFE] tracking-tight font-display">
          Operational Reference
        </h2>
        <p className="text-[#E4EBFE] text-sm font-sans">
          Execution modes, API key storage, and repository URL formatting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Panel 1: Structural Heuristic Preview Mode */}
        <div className="svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 hover:border-[#C7FC02]/60 transition-colors flex flex-col justify-between bg-[#012EA8]">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-[#012487] border border-[#FEFDFE]/15 text-[#C7FC02]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold font-display text-[#FEFDFE]">Heuristic Preview Mode</h3>
            </div>

            <p className="text-sm text-[#E4EBFE] leading-relaxed mb-3 font-sans">
              Executes locally without an API key to parse repository structure, manifest dependencies, and construct structural Mermaid diagrams.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-[#E4EBFE] border-t border-[#FEFDFE]/15 pt-3">
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">1.</span>
                <span>Paste any public GitHub repository URL into the input field.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">2.</span>
                <span>Leave API key empty for instantaneous zero-config AST scanning.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">3.</span>
                <span>Click <strong className="text-[#FEFDFE]">Generate Documentation</strong> for immediate preview.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Gemini AI Synthesis */}
        <div className="svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 hover:border-[#C7FC02]/60 transition-colors flex flex-col justify-between bg-[#012EA8] text-silver-bright">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-[#012487] border border-[#FEFDFE]/15 text-[#C7FC02]">
                <Key className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold font-display text-[#FEFDFE]">Deep Architectural Synthesis</h3>
            </div>

            <p className="text-sm text-[#E4EBFE] leading-relaxed mb-3 font-sans">
              Synthesizes multi-module documentation, component references, and API endpoint details using your custom key.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-[#E4EBFE] border-t border-[#FEFDFE]/15 pt-3">
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">1.</span>
                <span>Click <strong className="text-[#FEFDFE]">Add Gemini Key</strong> in the controls bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">2.</span>
                <span>Paste your Gemini API key (stored strictly in browser localStorage).</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-[#C7FC02] font-bold">3.</span>
                <span>Select <strong className="text-[#FEFDFE]">In-Depth</strong> scope for full module coverage.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3: Recommended Repositories & Practices */}
        <div className="svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 hover:border-[#C7FC02]/60 transition-colors flex flex-col justify-between bg-[#012EA8]">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-[#012487] border border-[#FEFDFE]/15 text-[#C7FC02]">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold font-display text-[#FEFDFE]">Best Practices & URLs</h3>
            </div>

            <p className="text-sm text-[#E4EBFE] leading-relaxed mb-3 font-sans">
              Repository URL conventions and language support for static and full-depth analysis.
            </p>

            <div className="space-y-1.5 text-xs font-mono text-[#E4EBFE] border-t border-[#FEFDFE]/15 pt-3">
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C7FC02] flex-shrink-0 mt-0.5" />
                <span>Provide clean root URLs: <code className="text-[#FEFDFE] bg-[#012487] px-1 py-0.5 rounded font-mono">github.com/owner/repo</code></span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C7FC02] flex-shrink-0 mt-0.5" />
                <span>Supports Python, TypeScript, JavaScript, Go, Rust, and Java.</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-[#C7FC02] flex-shrink-0 mt-0.5" />
                <span>Sample repositories (FastAPI, Zustand, Flask) are available in the input bar.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
