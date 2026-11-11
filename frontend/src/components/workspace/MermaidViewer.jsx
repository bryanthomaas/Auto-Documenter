import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Copy, Check, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function MermaidViewer({ chart }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [error, setError] = useState(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#012487',
        primaryColor: '#013CD3',
        primaryTextColor: '#FEFDFE',
        primaryBorderColor: '#C7FC02',
        lineColor: '#C7FC02',
        secondaryColor: '#012EA8',
        tertiaryColor: '#012487'
      },
      securityLevel: 'loose',
    });

    if (!chart) return;

    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setError(null);
        const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Mermaid render error:', err);
          setError('Could not render diagram. Raw syntax available below.');
        }
      }
    };

    renderDiagram();
    return () => { isMounted = false; };
  }, [chart]);

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText || navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(chart).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ocean-card rounded-xl p-5 my-6 overflow-hidden bg-[#012EA8] border border-[#FEFDFE]/20">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#FEFDFE]/15">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold font-display text-[#FEFDFE]">
            System Architecture Flow
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale(s => Math.min(s + 0.15, 2))}
            title="Zoom In"
            className="p-1.5 rounded bg-[#012487] hover:bg-[#013CD3] text-[#E4EBFE] hover:text-[#C7FC02] border border-[#FEFDFE]/15 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(s => Math.max(s - 0.15, 0.6))}
            title="Zoom Out"
            className="p-1.5 rounded bg-[#012487] hover:bg-[#013CD3] text-[#E4EBFE] hover:text-[#C7FC02] border border-[#FEFDFE]/15 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(1)}
            title="Reset Zoom"
            className="p-1.5 rounded bg-[#012487] hover:bg-[#013CD3] text-[#E4EBFE] hover:text-[#C7FC02] border border-[#FEFDFE]/15 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded bg-[#012487] hover:bg-[#013CD3] text-[#FEFDFE] hover:text-[#C7FC02] border border-[#FEFDFE]/15 transition-colors ml-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#C7FC02]" /> : <Copy className="w-3.5 h-3.5 text-[#C7FC02]" />}
            <span>{copied ? 'Copied' : 'Copy Mermaid'}</span>
          </button>
        </div>
      </div>

      <div className="overflow-auto max-h-[520px] flex items-center justify-center p-4 min-h-[220px] bg-[#012487]/60 rounded-lg">
        {error ? (
          <div className="w-full text-center py-6 text-sm text-[#E4EBFE]">
            <p className="mb-2 text-rose-200">{error}</p>
            <pre className="text-left bg-[#012487] p-4 rounded-lg text-xs font-mono text-[#FEFDFE] overflow-x-auto border border-[#FEFDFE]/15">
              {chart}
            </pre>
          </div>
        ) : svgContent ? (
          <div
            ref={containerRef}
            style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.15s ease-out' }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
            className="flex items-center justify-center [&_svg]:max-w-full [&_svg]:h-auto"
          />
        ) : (
          <div className="text-[#E4EBFE] text-sm font-mono">
            Rendering Architecture Diagram...
          </div>
        )}
      </div>
    </div>
  );
}
