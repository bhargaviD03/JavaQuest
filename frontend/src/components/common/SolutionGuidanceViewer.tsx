import React from 'react';
import { CodeBlock } from './CodeBlock';
import { Lightbulb, Code2, Cpu, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SolutionGuidanceViewerProps {
  content: string;
}

export const SolutionGuidanceViewer: React.FC<SolutionGuidanceViewerProps> = ({ content }) => {
  if (!content) return null;

  // Split content by code blocks: ```[language]\n[code]\n```
  const codeBlockRegex = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
  const segments: Array<{ type: 'text' | 'code'; text?: string; code?: string; lang?: string }> = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
      });
    }
    segments.push({
      type: 'code',
      lang: match[1] || 'java',
      code: match[2].trim(),
    });
    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.slice(lastIndex),
    });
  }

  // Helper to format inline markdown (bold and inline code)
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs border border-slate-200 dark:border-slate-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const renderTextSegment = (text: string, segIdx: number) => {
    const lines = text.split('\n');
    return (
      <div key={segIdx} className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;

          // Headers
          if (trimmed.startsWith('### ')) {
            const rawTitle = trimmed.replace('### ', '');
            // Strip any emojis to ensure strictly professional Lucide icon presentation
            const title = rawTitle.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
            let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';

            if (title.includes('Concept') || title.includes('Breakdown') || title.includes('Idea')) {
              icon = <Lightbulb className="w-4 h-4 text-amber-500" />;
              badgeBg = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
            } else if (title.includes('Code') || title.includes('Implementation') || title.includes('Solution')) {
              icon = <Code2 className="w-4 h-4 text-sky-500" />;
              badgeBg = 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
            } else if (title.includes('Execution') || title.includes('Memory') || title.includes('Walkthrough')) {
              icon = <Cpu className="w-4 h-4 text-indigo-500" />;
              badgeBg = 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            } else if (title.includes('Pitfall') || title.includes('Gotcha') || title.includes('Mistake') || title.includes('Trap')) {
              icon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
              badgeBg = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            }

            return (
              <div key={lIdx} className="pt-2">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${badgeBg}`}>
                  {icon}
                  <span>{title}</span>
                </div>
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span className="flex-1">{formatInlineText(trimmed.slice(2))}</span>
              </div>
            );
          }

          // Normal paragraph
          return (
            <p key={lIdx} className="leading-relaxed">
              {formatInlineText(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 pt-2">
      {segments.map((seg, idx) => {
        if (seg.type === 'code' && seg.code) {
          return (
            <div key={idx} className="my-2">
              <CodeBlock code={seg.code} language={seg.lang || 'java'} title="Solution Code (Main.java)" />
            </div>
          );
        }
        return seg.text ? renderTextSegment(seg.text, idx) : null;
      })}
    </div>
  );
};
