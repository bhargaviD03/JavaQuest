import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Terminal, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export interface ExecutionResult {
  compiled: boolean;
  output: string;
  errors?: string;
  executionTimeMs?: number;
  testResults?: Array<{
    name: string;
    passed: boolean;
    description: string;
  }>;
}

interface MonacoJavaEditorProps {
  initialCode: string;
  onExecute: (code: string) => Promise<ExecutionResult>;
  fileName?: string;
}

export const MonacoJavaEditor: React.FC<MonacoJavaEditorProps> = ({
  initialCode,
  onExecute,
  fileName = 'Solution.java',
}) => {
  const [code, setCode] = useState(initialCode);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [activeTab, setActiveTab] = useState<'console' | 'tests'>('console');

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await onExecute(code);
      setResult(res);
      if (res.testResults && res.testResults.length > 0) {
        setActiveTab('tests');
      } else {
        setActiveTab('console');
      }
    } catch (err: any) {
      setResult({
        compiled: false,
        output: '',
        errors: err.message || 'Execution failed. Please check network connection.',
      });
      setActiveTab('console');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Editor Header Bar */}
      <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
          <span className="ml-2 font-bold text-slate-200">{fileName}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            JDK 21
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-[11px]"
            title="Reset code to initial template"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            {isRunning ? 'Compiling...' : 'Compile & Run'}
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Workspace */}
      <div className="flex-1 min-h-[220px]">
        <Editor
          height="100%"
          defaultLanguage="java"
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'Fira Code, monospace',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
          }}
        />
      </div>

      {/* Execution Diagnostics Console */}
      <div className="border-t border-slate-800 bg-slate-900/90 text-xs font-mono">
        {/* Console Tab Selector */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('console')}
              className={`flex items-center gap-1.5 text-[11px] pb-0.5 ${
                activeTab === 'console'
                  ? 'text-emerald-400 font-bold border-b-2 border-emerald-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" /> Output Console
            </button>
            {result?.testResults && (
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex items-center gap-1.5 text-[11px] pb-0.5 ${
                  activeTab === 'tests'
                    ? 'text-emerald-400 font-bold border-b-2 border-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Test Suite ({result.testResults.filter((t) => t.passed).length}/
                {result.testResults.length})
              </button>
            )}
          </div>

          {result && (
            <div className="flex items-center gap-3 text-[10px]">
              {result.compiled ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> javac 0
                </span>
              ) : (
                <span className="text-rose-400 font-bold flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Compilation Error
                </span>
              )}
              {result.executionTimeMs !== undefined && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {result.executionTimeMs}ms
                </span>
              )}
            </div>
          )}
        </div>

        {/* Console Body Area */}
        <div className="p-3 max-h-36 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {activeTab === 'console' && (
            <div>
              {result ? (
                <>
                  {result.errors && (
                    <div className="text-rose-400 whitespace-pre-wrap flex items-start gap-1.5 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>{result.errors}</span>
                    </div>
                  )}
                  {result.output ? (
                    <pre className="text-slate-200 whitespace-pre-wrap">{result.output}</pre>
                  ) : (
                    !result.errors && <span className="text-slate-500">Program executed cleanly with no stdout.</span>
                  )}
                </>
              ) : (
                <span className="text-slate-500">Ready. Click "Compile & Run" to execute your Java code.</span>
              )}
            </div>
          )}

          {activeTab === 'tests' && result?.testResults && (
            <div className="space-y-1.5">
              {result.testResults.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center justify-between ${
                    t.passed ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {t.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <strong>{t.name}</strong>
                  </div>
                  <span className="text-[10px] text-slate-400">{t.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
