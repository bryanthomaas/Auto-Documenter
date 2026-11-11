import React from 'react';
import { GitBranch, Cpu, Layers } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Repository Ingestion',
    icon: GitBranch,
    description: 'Enter a public GitHub repository URL. The engine clones the repo, filters source files, and indexes codebase manifests.'
  },
  {
    step: '02',
    title: 'Structural Code Analysis',
    icon: Cpu,
    description: 'Extracts module relationships, dependencies, AST symbols, and tech stack details directly from source files.'
  },
  {
    step: '03',
    title: 'Interactive Architecture',
    icon: Layers,
    description: 'Explore living documentation, interactive Mermaid diagrams, and export complete Markdown ZIP bundles.'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works-section" data-animate="how-it-works" className="w-full scroll-mt-16">
      <div className="mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#FEFDFE]/15 pb-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#FEFDFE] tracking-tight font-display">
          How It Works
        </h2>
        <p className="text-[#E4EBFE] text-sm font-sans">
          From public repository to interactive architecture reference in three steps.
        </p>
      </div>

      <div className="relative">
        {/* Horizontal Connector Line for Desktop */}
        <div className="hidden md:block absolute top-1/2 left-8 right-8 -translate-y-6 h-px border-t border-dashed border-[#FEFDFE]/20 pointer-events-none z-0" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="ocean-card svz-panel p-5 rounded-xl border border-[#FEFDFE]/20 hover:border-[#C7FC02]/60 transition-colors relative flex flex-col justify-between bg-[#012EA8]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[#012487] border border-[#FEFDFE]/15 flex items-center justify-center text-[#C7FC02]">
                      <Icon className="w-4 h-4 text-[#C7FC02]" />
                    </div>
                    <span className="text-xl font-mono font-bold text-[#C7FC02]">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold font-display text-[#FEFDFE] mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-sm text-[#E4EBFE] leading-relaxed font-sans">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
