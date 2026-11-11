import React from 'react';
import { 
  GitBranch, 
  Search, 
  Cpu, 
  Archive, 
  CheckCircle2, 
  AlertCircle,
  Loader2 
} from 'lucide-react';

export default function LiveProgress({ status, progress, message, error, onRetry }) {
  const stages = [
    { key: 'CLONING', label: 'Clone', icon: GitBranch },
    { key: 'ANALYZING', label: 'Analyze', icon: Search },
    { key: 'SYNTHESIZING', label: 'Synthesize', icon: Cpu },
    { key: 'PACKAGING', label: 'Package', icon: Archive },
  ];

  const getStageStatus = (stageKey) => {
    const stageOrder = ['CLONING', 'ANALYZING', 'SYNTHESIZING', 'PACKAGING', 'COMPLETED'];
    const currentIndex = stageOrder.indexOf(status);
    const targetIndex = stageOrder.indexOf(stageKey);

    if (status === 'COMPLETED' || currentIndex > targetIndex) return 'complete';
    if (currentIndex === targetIndex) return 'active';
    return 'pending';
  };

  const displayProgress = typeof progress === 'number' ? progress : 10;

  return (
    <div className="w-full max-w-lg mx-auto ocean-card p-6 sm:p-8 rounded-2xl border border-[#FEFDFE]/20 shadow-xl bg-[#012EA8]">
      {status === 'FAILED' ? (
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-300/40 flex items-center justify-center mb-4 text-rose-200">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold font-display text-[#FEFDFE] mb-2">Generation Failed</h3>
          <p className="text-sm text-[#E4EBFE] mb-6 max-w-md font-sans">
            {error || message || 'An unexpected error occurred during analysis.'}
          </p>
          <button
            onClick={onRetry}
            className="px-5 py-2 rounded-lg bg-[#C7FC02] hover:bg-[#d4fd33] text-[#011650] font-semibold text-xs transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          {/* Circular Progress Indicator */}
          <div className="relative w-20 h-20 mb-5">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                className="text-[#FEFDFE]/15"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="5"
                fill="none"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * displayProgress) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                className="text-[#C7FC02]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-mono font-bold text-[#FEFDFE] tabular-nums">
                {displayProgress}%
              </span>
            </div>
          </div>

          <h3 className="text-lg font-semibold font-display text-[#FEFDFE] mb-1 flex items-center gap-2">
            {status === 'COMPLETED' ? (
              <CheckCircle2 className="w-4 h-4 text-[#C7FC02]" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin text-[#C7FC02]" />
            )}
            {status === 'COMPLETED' ? 'Documentation Complete' : 'Analyzing Codebase'}
          </h3>
          <p className="text-xs text-[#E4EBFE] font-mono mb-6 min-h-[18px]">
            {message || 'Processing repository...'}
          </p>

          {/* Stepper Pipeline */}
          <div className="w-full grid grid-cols-4 gap-2 pt-4 border-t border-[#FEFDFE]/15">
            {stages.map((st) => {
              const Icon = st.icon;
              const state = getStageStatus(st.key);

              return (
                <div key={st.key} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono transition-colors ${
                      state === 'complete'
                        ? 'bg-[#012487] text-[#C7FC02] border border-[#C7FC02]/50'
                        : state === 'active'
                        ? 'bg-[#C7FC02] text-[#011650] border border-[#C7FC02] font-bold'
                        : 'bg-[#012487] text-[#B2C6FA] border border-[#FEFDFE]/15'
                    }`}
                  >
                    {state === 'complete' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium font-sans ${
                      state === 'active' ? 'text-[#C7FC02] font-bold' : state === 'complete' ? 'text-[#FEFDFE]' : 'text-[#B2C6FA]'
                    }`}
                  >
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
