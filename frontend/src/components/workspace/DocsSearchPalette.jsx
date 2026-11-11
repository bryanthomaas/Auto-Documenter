import React, { useRef, useMemo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { 
  Search, 
  X, 
  ArrowRight, 
  Layers, 
  FolderTree, 
  Terminal, 
  BookOpen, 
  Workflow, 
  FileCode2,
  Sparkles 
} from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function DocsSearchPalette({ 
  docs, 
  searchQuery, 
  onSearchChange, 
  onSelectSection, 
  isOpen, 
  onClose 
}) {
  const containerRef = useRef(null);

  useGSAP(() => {
    if (!containerRef.current) return;
    if (isOpen) {
      gsap.fromTo(
        containerRef.current,
        { autoAlpha: 0, y: -10, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, { scope: containerRef, dependencies: [isOpen] });

  const searchResults = useMemo(() => {
    if (!docs || !searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];

    // Helper to find preview snippet
    const getSnippet = (text) => {
      if (!text) return '';
      const idx = text.toLowerCase().indexOf(q);
      if (idx === -1) return text.substring(0, 80) + '...';
      const start = Math.max(0, idx - 30);
      const end = Math.min(text.length, idx + q.length + 50);
      return (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    };

    // 1. Overview
    if (docs.overview?.toLowerCase().includes(q)) {
      results.push({
        sectionId: 'overview',
        title: 'Project Overview',
        icon: Sparkles,
        snippet: getSnippet(docs.overview)
      });
    }

    // 2. Architecture
    if (docs.architecture?.toLowerCase().includes(q) || docs.mermaid_diagram?.toLowerCase().includes(q)) {
      results.push({
        sectionId: 'architecture',
        title: 'Architecture & System Flow',
        icon: Workflow,
        snippet: getSnippet(docs.architecture || docs.mermaid_diagram)
      });
    }

    // 3. Tech Stack
    docs.tech_stack?.forEach(item => {
      if (item.name?.toLowerCase().includes(q) || item.purpose?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q)) {
        results.push({
          sectionId: 'tech_stack',
          title: `Tech Stack: ${item.name}`,
          icon: Layers,
          snippet: `${item.category}: ${item.purpose}`
        });
      }
    });

    // 4. Modules
    docs.modules?.forEach(mod => {
      if (mod.name?.toLowerCase().includes(q) || mod.path?.toLowerCase().includes(q) || mod.purpose?.toLowerCase().includes(q)) {
        results.push({
          sectionId: 'modules',
          title: `Module: ${mod.name} (${mod.path})`,
          icon: FolderTree,
          snippet: mod.purpose
        });
      }
    });

    // 5. API Reference
    if (docs.api_reference?.toLowerCase().includes(q)) {
      results.push({
        sectionId: 'api_reference',
        title: 'API Reference & Endpoints',
        icon: Terminal,
        snippet: getSnippet(docs.api_reference)
      });
    }

    // 6. Getting Started
    if (docs.getting_started?.toLowerCase().includes(q)) {
      results.push({
        sectionId: 'getting_started',
        title: 'Getting Started Guide',
        icon: BookOpen,
        snippet: getSnippet(docs.getting_started)
      });
    }

    // 7. File Tree matches
    const matchingFiles = docs.file_tree?.filter(f => (f?.name || f || '').toString().toLowerCase().includes(q)) || [];
    if (matchingFiles.length > 0) {
      results.push({
        sectionId: 'file_tree',
        title: `Files (${matchingFiles.length} matched)`,
        icon: FileCode2,
        snippet: matchingFiles.slice(0, 3).map(f => (f?.name || f)).join(', ') + (matchingFiles.length > 3 ? ` +${matchingFiles.length - 3} more` : '')
      });
    }

    return results;
  }, [docs, searchQuery]);

  if (!isOpen && (!searchQuery || searchQuery.trim().length === 0)) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#012487] opacity-100 rounded-xl border border-[#FEFDFE]/20 shadow-2xl overflow-hidden max-h-[420px] flex flex-col"
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#012EA8] border-b border-[#FEFDFE]/15 text-xs text-[#E4EBFE] font-mono">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#C7FC02]" />
          <span>
            {searchQuery ? `${searchResults.length} matches found` : 'Search documentation...'}
          </span>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-1 hover:text-[#C7FC02] transition-colors rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-y-auto p-2 space-y-1">
        {searchResults.length > 0 ? (
          searchResults.map((res, idx) => {
            const Icon = res.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  onSelectSection(res.sectionId);
                  if (onClose) onClose();
                }}
                className="w-full text-left p-3 rounded-lg hover:bg-[#012EA8] border border-transparent hover:border-[#C7FC02]/40 transition-colors flex items-start gap-3 group"
              >
                <div className="p-2 rounded bg-[#012EA8] text-[#C7FC02] border border-[#FEFDFE]/15">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold font-display text-[#FEFDFE] transition-colors truncate">
                      {res.title}
                    </h5>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#012EA8] text-[#C7FC02] ml-2 flex-shrink-0">
                      {res.sectionId}
                    </span>
                  </div>
                  <p className="text-xs text-[#E4EBFE] mt-1 line-clamp-2 font-mono">
                    {res.snippet}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-[#C7FC02] opacity-0 group-hover:opacity-100 transition-opacity self-center" />
              </button>
            );
          })
        ) : (
          <div className="p-6 text-center text-xs text-[#E4EBFE] font-mono">
            {searchQuery.length < 2 ? (
              <span>Type at least 2 characters to search across all sections</span>
            ) : (
              <span>No documentation sections matched "{searchQuery}"</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
