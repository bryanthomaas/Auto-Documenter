import React from 'react';
import { 
  Network, 
  FolderTree, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Archive 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Network,
    title: 'Architecture Diagrams',
    description: 'Interactive Mermaid dependency flowcharts and pan-and-zoom module relationship diagrams.'
  },
  {
    icon: FolderTree,
    title: 'Codebase Topology',
    description: 'AST symbol extraction, call-graph relationships, and complete directory trees.'
  },
  {
    icon: Layers,
    title: 'Tech Stack Detection',
    description: 'Automatic detection of languages, frameworks, dependencies, and configuration manifests.'
  },
  {
    icon: Zap,
    title: 'Configurable Scope',
    description: 'Fast structural AST scan or in-depth multi-module synthesis with full API references.'
  },
  {
    icon: ShieldCheck,
    title: 'Zero-Config Offline',
    description: 'Instant local structural analysis and architecture diagrams without requiring an API key.'
  },
  {
    icon: Archive,
    title: 'Markdown & ZIP Export',
    description: 'One-click ZIP download of complete Markdown documentation and docs.json bundle.'
  }
];

export default function FeatureGrid() {
  return (
    <section className="w-full">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#FEFDFE]/15 pb-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#FEFDFE] tracking-tight font-display">
          Capabilities
        </h2>
        <p className="text-[#E4EBFE] text-sm font-sans">
          Static AST topology, dependency flowcharts, and portable Markdown exports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              data-animate="feature-card"
              className="svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 hover:border-[#C7FC02]/60 transition-colors relative flex flex-col justify-between bg-[#012EA8]"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-[#012487] border border-[#FEFDFE]/15 flex items-center justify-center text-[#C7FC02] mb-3">
                  <Icon className="w-4 h-4 text-[#C7FC02]" />
                </div>

                <h3 className="text-lg font-semibold font-display text-[#FEFDFE] mb-1.5">
                  {feature.title}
                </h3>

                <p className="text-sm text-[#E4EBFE] leading-relaxed font-sans">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
