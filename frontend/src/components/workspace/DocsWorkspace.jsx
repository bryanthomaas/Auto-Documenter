import React, { useState, useMemo } from 'react';
import TopHeader from './TopHeader';
import DocsSidebar from './DocsSidebar';
import MarkdownViewer from './MarkdownViewer';
import MermaidViewer from './MermaidViewer';
import { Layers, Folder, File, Code, Terminal, CheckCircle2, Search, X } from 'lucide-react';

export default function DocsWorkspace({ docs, downloadUrl, onReset }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTree = useMemo(() => {
    if (!docs?.file_tree) return [];
    if (!searchQuery) return docs.file_tree;
    return docs.file_tree.filter(f => (f?.name || f || '').toString().toLowerCase().includes(searchQuery.toLowerCase()));
  }, [docs?.file_tree, searchQuery]);

  const filteredModules = useMemo(() => {
    if (!docs?.modules) return [];
    if (!searchQuery) return docs.modules;
    const q = searchQuery.toLowerCase();
    return docs.modules.filter(m => 
      m.name?.toLowerCase().includes(q) || 
      m.path?.toLowerCase().includes(q) || 
      m.purpose?.toLowerCase().includes(q) ||
      m.key_files?.some(f => f.toLowerCase().includes(q))
    );
  }, [docs?.modules, searchQuery]);

  const filteredTechStack = useMemo(() => {
    if (!docs?.tech_stack) return [];
    if (!searchQuery) return docs.tech_stack;
    const q = searchQuery.toLowerCase();
    return docs.tech_stack.filter(t => 
      t.name?.toLowerCase().includes(q) || 
      t.category?.toLowerCase().includes(q) || 
      t.purpose?.toLowerCase().includes(q)
    );
  }, [docs?.tech_stack, searchQuery]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#013CD3] text-[#FEFDFE] font-sans">
      <TopHeader
        docs={docs}
        downloadUrl={downloadUrl}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectSection={setActiveSection}
        onReset={onReset}
      />

      <div className="flex-1 flex overflow-hidden">
        <DocsSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          docs={docs}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 w-full max-w-none">
          {/* Active Search Filter Banner */}
          {searchQuery && (
            <div className="mb-5 p-3 rounded-lg bg-[#012487] border border-[#C7FC02]/40 flex items-center justify-between gap-3 text-xs font-mono text-[#FEFDFE]">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-[#C7FC02]" />
                <span>
                  Filtering active view for: <strong className="text-[#C7FC02]">"{searchQuery}"</strong>
                </span>
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1 text-[#E4EBFE] hover:text-[#FEFDFE] transition-colors px-2 py-0.5 rounded bg-[#012EA8] border border-[#FEFDFE]/15"
              >
                <X className="w-3 h-3" />
                <span>Clear filter</span>
              </button>
            </div>
          )}

          {/* Section: Overview */}
          {activeSection === 'overview' && (
            <div>
              <MarkdownViewer content={docs?.overview} />
            </div>
          )}

          {/* Section: Architecture & Mermaid Flow */}
          {activeSection === 'architecture' && (
            <div>
              <MarkdownViewer content={docs?.architecture} />
              {docs?.mermaid_diagram && (
                <MermaidViewer chart={docs.mermaid_diagram} />
              )}
            </div>
          )}

          {/* Section: Tech Stack */}
          {activeSection === 'tech_stack' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold font-display text-[#FEFDFE] mb-2 pb-2 border-b border-[#FEFDFE]/15">
                Technology Stack & Dependencies
              </h2>
              {filteredTechStack.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTechStack.map((item, idx) => (
                    <div key={idx} className="svz-panel p-4 rounded-xl border border-[#FEFDFE]/20 bg-[#012EA8] flex flex-col justify-between hover:border-[#C7FC02]/60 transition-colors">
                      <div>
                        <span className="text-xs font-mono text-[#C7FC02] font-semibold">
                          {item.category}
                        </span>
                        <h4 className="text-lg font-bold font-display text-[#FEFDFE] mt-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-[#E4EBFE] mt-1.5 font-sans leading-relaxed">
                          {item.purpose}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#B2C6FA] text-sm font-mono">No tech stack items matched "{searchQuery}"</p>
              )}
            </div>
          )}

          {/* Section: Modules & Components */}
          {activeSection === 'modules' && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold font-display text-[#FEFDFE] mb-2 pb-2 border-b border-[#FEFDFE]/15">
                Architecture Modules
              </h2>
              {filteredModules.length > 0 ? (
                <div className="space-y-4">
                  {filteredModules.map((mod, idx) => (
                    <div key={idx} className="svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 bg-[#012EA8] hover:border-[#C7FC02]/50 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <Folder className="w-5 h-5 text-[#C7FC02]" />
                        <h3 className="text-lg font-bold font-display text-[#FEFDFE]">{mod.name}</h3>
                        <code className="text-xs font-mono bg-[#012487] border border-[#FEFDFE]/15 px-2 py-0.5 rounded text-[#C7FC02] ml-auto">
                          {mod.path}
                        </code>
                      </div>
                      <p className="text-sm text-[#E4EBFE] mb-3 font-sans leading-relaxed">{mod.purpose}</p>
                      {mod.key_files?.length > 0 && (
                        <div className="border-t border-[#FEFDFE]/15 pt-3">
                          <span className="text-xs font-sans font-semibold text-[#B2C6FA] block mb-2">
                            Key files
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {mod.key_files.map((file, fIdx) => (
                              <code
                                key={fIdx}
                                className="inline-flex items-center gap-1.5 text-xs font-mono bg-[#012487] border border-[#FEFDFE]/15 px-2.5 py-1 rounded text-[#FEFDFE]"
                              >
                                <File className="w-3 h-3 text-[#C7FC02]" />
                                {file}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#B2C6FA] text-sm font-mono">No modules matched "{searchQuery}"</p>
              )}
            </div>
          )}

          {/* Section: API Reference */}
          {activeSection === 'api_reference' && (
            <div>
              <MarkdownViewer content={docs?.api_reference} />
            </div>
          )}

          {/* Section: Getting Started */}
          {activeSection === 'getting_started' && (
            <div>
              <MarkdownViewer content={docs?.getting_started} />
            </div>
          )}

          {/* Section: Repository Tree */}
          {activeSection === 'file_tree' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#FEFDFE]/15">
                <h2 className="text-xl font-bold font-display text-[#FEFDFE]">Repository Files</h2>
                <span className="text-xs font-mono text-[#C7FC02] font-semibold">
                  Showing {filteredTree.length} files
                </span>
              </div>
              <div className="svz-panel rounded-xl p-4 max-h-[600px] overflow-y-auto space-y-1 font-mono text-xs bg-[#012EA8] border border-[#FEFDFE]/20">
                {filteredTree.map((filePath, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 py-1 px-2 rounded hover:bg-[#012487] text-[#FEFDFE] transition-colors"
                  >
                    <Code className="w-3.5 h-3.5 text-[#C7FC02]" />
                    <span>{(filePath?.name || filePath)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
