import React from 'react';
import { 
  Compass, 
  Workflow, 
  Layers, 
  FolderTree, 
  Terminal, 
  BookOpen, 
  FileCode2 
} from 'lucide-react';

export default function DocsSidebar({ activeSection, onSelectSection, docs }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'architecture', label: 'Architecture & Flow', icon: Workflow },
    { id: 'tech_stack', label: 'Tech Stack', icon: Layers, count: docs?.tech_stack?.length },
    { id: 'modules', label: 'Modules & Components', icon: FolderTree, count: docs?.modules?.length },
    { id: 'api_reference', label: 'API Reference', icon: Terminal },
    { id: 'getting_started', label: 'Getting Started', icon: BookOpen },
    { id: 'file_tree', label: 'Repository Tree', icon: FileCode2, count: docs?.file_tree?.length },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-[#012487] border-r border-[#FEFDFE]/15 flex flex-col h-full overflow-y-auto">
      <div className="p-3.5 border-b border-[#FEFDFE]/15">
        <span className="text-xs font-display font-semibold text-[#E4EBFE]">
          Sections
        </span>
      </div>

      <nav className="p-2 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-sans transition-colors ${
                isActive
                  ? 'bg-[#C7FC02] text-[#011650] font-bold'
                  : 'text-[#E4EBFE] hover:text-[#FEFDFE] hover:bg-[#012EA8] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#011650]' : 'text-[#C7FC02]'}`} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-mono tabular-nums ${
                  isActive ? 'bg-[#011650]/15 text-[#011650] font-bold' : 'text-[#B2C6FA]'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-3.5 border-t border-[#FEFDFE]/15 text-xs text-[#E4EBFE] space-y-1 font-mono">
        <div className="flex justify-between">
          <span>Framework</span>
          <span className="text-[#FEFDFE] font-sans font-semibold">{docs?.detected_framework || 'General'}</span>
        </div>
        <div className="flex justify-between">
          <span>Files</span>
          <span className="text-[#FEFDFE] tabular-nums">{docs?.total_files || 0}</span>
        </div>
        <div className="flex justify-between">
          <span>Lines</span>
          <span className="text-[#FEFDFE] tabular-nums">{docs?.total_lines?.toLocaleString() || 0}</span>
        </div>
      </div>
    </aside>
  );
}
