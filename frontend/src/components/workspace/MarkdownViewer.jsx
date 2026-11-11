import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check } from 'lucide-react';

function CodeBlock({ inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false);
  const codeString = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const isInline = inline !== undefined ? inline : (!match && !String(children).includes('\n'));

  if (isInline) {
    return (
      <code className="bg-[#012487] px-1.5 py-0.5 rounded text-sm font-mono text-[#C7FC02] border border-[#FEFDFE]/15" {...props}>
        {children}
      </code>
    );
  }

  const handleCopy = () => {
    if (navigator?.clipboard?.writeText || navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(codeString).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-lg overflow-hidden border border-[#FEFDFE]/20 bg-[#012487]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#012EA8] border-b border-[#FEFDFE]/15 text-xs text-[#E4EBFE] font-mono">
        <span>{match ? match[1] : 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[#C7FC02] hover:text-[#FEFDFE] transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-[#C7FC02]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm font-mono text-[#FEFDFE] leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function MarkdownViewer({ content }) {
  if (!content) return null;

  return (
    <div className="prose prose-invert max-w-none text-[#FEFDFE] font-sans space-y-4">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          h1: ({ children }) => (
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-[#FEFDFE] pb-3 border-b border-[#FEFDFE]/15 mt-4 mb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl md:text-2xl font-semibold font-display text-[#FEFDFE] mt-6 mb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold font-display text-[#C7FC02] mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-[#E4EBFE] font-sans leading-relaxed my-3">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 text-[#E4EBFE] font-sans my-3">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 text-[#E4EBFE] font-sans my-3">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#C7FC02] pl-4 py-2 bg-[#012EA8] my-4 text-[#FEFDFE] rounded-r">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border-collapse border border-[#FEFDFE]/20">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-[#FEFDFE]/20 bg-[#012EA8] px-4 py-2 text-sm font-semibold font-display text-[#FEFDFE]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[#FEFDFE]/20 px-4 py-2 text-sm text-[#E4EBFE]">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
