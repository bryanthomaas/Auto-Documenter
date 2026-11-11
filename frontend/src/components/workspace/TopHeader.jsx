import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  Search, 
  RotateCcw,
  Sparkles,
  Command
} from 'lucide-react';
import AutoDocLogo from '../common/AutoDocLogo';
import ShinyText from '../reactbits/ShinyText/ShinyText';
import DocsSearchPalette from './DocsSearchPalette';

export default function TopHeader({ 
  docs, 
  downloadUrl, 
  searchQuery, 
  onSearchChange, 
  onSelectSection,
  onReset 
}) {
  const [copied, setCopied] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Keyboard shortcut (Cmd+K / Ctrl+K or '/') to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchOpen(true);
    if (searchContainerRef.current) {
      gsap.to(searchContainerRef.current, {
        scale: 1.02,
        boxShadow: '0 0 25px rgba(0, 240, 255, 0.35)',
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  };

  const handleSearchBlur = () => {
    // Delay closing slightly so clicking search results works
    setTimeout(() => {
      setIsSearchOpen(false);
      if (searchContainerRef.current) {
        gsap.to(searchContainerRef.current, {
          scale: 1,
          boxShadow: 'none',
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }, 250);
  };

  const handleCopyAll = () => {
    if (!docs) return;
    const safe = (v) => v || '';
    const fullMarkdown = `
# ${safe(docs.repo_name)} Documentation

${safe(docs.overview)}

---

${safe(docs.architecture)}

\`\`\`mermaid
${safe(docs.mermaid_diagram)}
\`\`\`

---

${safe(docs.api_reference)}

---

${safe(docs.getting_started)}
    `.trim();

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(fullMarkdown).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="bg-[#012487] border-b border-[#FEFDFE]/15 px-6 h-14 flex items-center justify-between gap-4 sticky top-0 z-40">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-3">
          <AutoDocLogo size={32} showWordmark={false} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-display text-[#FEFDFE] tracking-tight truncate max-w-xs">
                {docs?.repo_name || 'Codebase Hub'}
              </h2>
              {docs?.repo_url && (
                <a
                  href={docs.repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#B2C6FA] hover:text-[#C7FC02] transition-colors"
                  title="View on GitHub"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {(docs?.overview?.includes('structural preview') || docs?.overview?.toLowerCase()?.includes('structural preview') || docs?.is_heuristic) && (
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#012EA8] text-[#C7FC02] border border-[#C7FC02]/40">
                  <span>Structural Heuristic Preview</span>
                </span>
              )}
            </div>
            <span className="text-xs text-[#E4EBFE] font-mono">
              {docs?.detected_framework || 'Repository Documentation'}
            </span>
          </div>
        </div>
      </div>

      {/* GSAP-Animated Global Search Bar with Search Palette Dropdown */}
      <div ref={searchContainerRef} className="flex-1 max-w-md relative hidden md:block rounded-lg">
        <Search className="w-3.5 h-3.5 text-[#B2C6FA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          placeholder="Search all documentation sections... (Press / to search)"
          className="w-full pl-9 pr-10 py-1.5 rounded-lg ocean-input border border-[#FEFDFE]/20 text-xs font-mono text-[#FEFDFE] placeholder-[#B2C6FA] focus:outline-none focus:border-[#C7FC02] focus:ring-1 focus:ring-[#C7FC02] transition-all bg-[#061325] opacity-100"
        />
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none text-[10px] text-[#E4EBFE] font-mono bg-[#012EA8] border border-[#FEFDFE]/15 px-1.5 py-0.5 rounded">
          <Command className="w-2.5 h-2.5" />
          <span>K</span>
        </div>

        {/* Global Search Results Palette */}
        {isSearchOpen && (
          <DocsSearchPalette
            docs={docs}
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onSelectSection={onSelectSection}
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </div>

      {/* Boxed Navigation Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#012EA8] hover:bg-[#013CD3] text-xs font-medium text-[#FEFDFE] border border-[#FEFDFE]/20 transition-colors"
          title="Copy full documentation as Markdown"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#C7FC02]" /> : <Copy className="w-3.5 h-3.5 text-[#C7FC02]" />}
          <span className="hidden sm:inline font-mono">{copied ? 'Copied' : 'Copy Full MD'}</span>
        </button>

        {downloadUrl && (
          <a
            href={downloadUrl}
            download
            className="btn-royal-shine flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-sans">Download ZIP</span>
          </a>
        )}

        <button
          onClick={onReset}
          className="p-1.5 rounded-lg bg-[#012EA8] hover:bg-[#013CD3] text-[#E4EBFE] hover:text-[#C7FC02] border border-[#FEFDFE]/20 transition-colors"
          title="Analyze another repository"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
