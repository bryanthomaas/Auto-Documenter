import React from 'react';
import { Info, Sparkles, Key, ArrowRight } from 'lucide-react';

/**
 * PreviewBanner Component
 * 
 * Displays a prominent alert banner when the application operates in
 * Structural Heuristic Preview Mode (no Gemini API key supplied or server-configured).
 */
export default function PreviewBanner({ 
  apiKey = '', 
  serverConfigured = false, 
  onConfigureKey,
  className = '' 
}) {
  // Determine if Structural Heuristic Preview Mode is active
  const isHeuristic = (!apiKey || apiKey.trim() === '') && !serverConfigured;

  if (!isHeuristic) {
    return null;
  }

  return (
    <div 
      className={`w-full rounded-lg border border-[#FEFDFE]/20 ocean-card bg-[#012CA2] px-4 py-2.5 text-left ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-sans text-[#E4EBFE]">
          <Info className="w-4 h-4 text-[#C7FC02] flex-shrink-0" />
          <span>
            <strong className="text-[#FEFDFE] font-semibold">Structural Heuristic Preview:</strong> Local AST analysis active. Add a Gemini key for module synthesis
          </span>
        </div>

        {onConfigureKey && (
          <button
            type="button"
            onClick={onConfigureKey}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-[#012487] hover:bg-[#C7FC02] text-[#FEFDFE] hover:text-[#011650] border border-[#FEFDFE]/20 hover:border-[#C7FC02] transition-colors flex-shrink-0 font-sans"
            title="Configure Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Configure Key</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
