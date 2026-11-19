import React, { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Play,
  RotateCcw,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Download,
  Copy,
  Trash2,
  Code2,
  FileCode,
  Sparkles,
  Cpu,
  Layers,
  HelpCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

// Live Syntax Marker definition
interface DiagnosticMarker {
  startLineNumber: number;
  startColumn: number;
  endLineNumber: number;
  endColumn: number;
  message: string;
  severity: number; // 8 = Error, 4 = Warning, 2 = Info
}

// Built-in MNC Interview Templates
const CODE_TEMPLATES: Record<string, { title: string; company: string; code: string }> = {
  blank: {
    title: 'Standard Application (Main.java)',
    company: 'General',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, JavaQuest Cloud IDE!");
        
        // Write your custom Java logic here
        List<String> list = Arrays.asList("Spring Boot", "JVM", "Multithreading", "Algorithms");
        for (String item : list) {
            System.out.println("-> Learning: " + item);
        }
    }
}
`,
  },
  two_sum: {
    title: 'Two Sum (LeetCode #1)',
    company: 'Google / Amazon / Apple',
    code: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }

    public static void main(String[] args) {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Target: " + target);
        System.out.println("Indices: " + Arrays.toString(result));
    }
}
`,
  },
  lru_cache: {
    title: 'LRU Cache (LeetCode #146)',
    company: 'Amazon / Microsoft / Netflix',
    code: `import java.util.*;

public class Main {
    static class LRUCache {
        private final int capacity;
        private final LinkedHashMap<Integer, Integer> map;

        public LRUCache(int capacity) {
            this.capacity = capacity;
            this.map = new LinkedHashMap<>(capacity, 0.75f, true) {
                @Override
                protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                    return size() > capacity;
                }
            };
        }

        public int get(int key) {
            return map.getOrDefault(key, -1);
        }

        public void put(int key, int value) {
            map.put(key, value);
        }
    }

    public static void main(String[] args) {
        LRUCache cache = new LRUCache(2);
        cache.put(1, 100);
        cache.put(2, 200);
        System.out.println("get(1): " + cache.get(1)); // returns 100
        cache.put(3, 300); // evicts key 2
        System.out.println("get(2) (evicted): " + cache.get(2)); // returns -1
        System.out.println("get(3): " + cache.get(3)); // returns 300
    }
}
`,
  },
  producer_consumer: {
    title: 'Producer-Consumer Threading',
    company: 'Goldman Sachs / Morgan Stanley',
    code: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    queue.put(i);
                    System.out.println("[Producer] Produced order #" + i);
                    Thread.sleep(100);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    int val = queue.take();
                    System.out.println("  [Consumer] Processed order #" + val);
                    Thread.sleep(150);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("[Complete] All concurrent tasks executed safely.");
    }
}
`,
  },
  scanner_input: {
    title: 'Standard Input / Scanner Demo',
    company: 'HackerRank / TCS / Infosys',
    code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.println("=== Java Interactive Standard Input ===");
        
        if (scanner.hasNext()) {
            String name = scanner.next();
            System.out.println("Welcome, " + name + "!");
        } else {
            System.out.println("Notice: No standard input detected. Provide text in the 'Standard Input (stdin)' tab.");
        }
        
        scanner.close();
    }
}
`,
  },
};

export const JavaIDEPage: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>('blank');
  const [code, setCode] = useState<string>(CODE_TEMPLATES.blank.code);
  const [stdin, setStdin] = useState<string>('Developer');
  const [fontSize, setFontSize] = useState<number>(14);

  // Diagnostics & Results
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [output, setOutput] = useState<string>('Ready. Click "Compile & Run" (or press Ctrl + Enter) to execute your Java code.');
  const [errors, setErrors] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [liveErrors, setLiveErrors] = useState<DiagnosticMarker[]>([]);
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'errors' | 'stdin'>('output');
  const [copied, setCopied] = useState<boolean>(false);

  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Real-time Java Syntax Linter function
  const validateJavaSyntax = (currentCode: string): DiagnosticMarker[] => {
    const markers: DiagnosticMarker[] = [];
    const lines = currentCode.split('\n');

    // 1. Check bracket and brace balance with line tracking
    const braceStack: { char: string; line: number; col: number }[] = [];
    const parenStack: { char: string; line: number; col: number }[] = [];
    const bracketStack: { char: string; line: number; col: number }[] = [];

    lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;
      let inString = false;
      let stringChar = '';

      for (let col = 0; col < lineText.length; col++) {
        const char = lineText[col];
        const prevChar = col > 0 ? lineText[col - 1] : '';

        // Ignore comments
        if (!inString && char === '/' && lineText[col + 1] === '/') {
          break; // Rest of line is comment
        }

        // String boundary tracking
        if ((char === '"' || char === "'") && prevChar !== '\\') {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (stringChar === char) {
            inString = false;
          }
          continue;
        }

        if (inString) continue;

        // Parentheses
        if (char === '(') parenStack.push({ char, line: lineNum, col: col + 1 });
        else if (char === ')') {
          if (parenStack.length === 0) {
            markers.push({
              startLineNumber: lineNum,
              startColumn: col + 1,
              endLineNumber: lineNum,
              endColumn: col + 2,
              message: "Syntax error: Unexpected closing parenthesis ')' without opening match.",
              severity: 8, // Error
            });
          } else {
            parenStack.pop();
          }
        }

        // Brackets
        if (char === '[') bracketStack.push({ char, line: lineNum, col: col + 1 });
        else if (char === ']') {
          if (bracketStack.length === 0) {
            markers.push({
              startLineNumber: lineNum,
              startColumn: col + 1,
              endLineNumber: lineNum,
              endColumn: col + 2,
              message: "Syntax error: Unexpected closing square bracket ']' without opening match.",
              severity: 8,
            });
          } else {
            bracketStack.pop();
          }
        }

        // Braces
        if (char === '{') braceStack.push({ char, line: lineNum, col: col + 1 });
        else if (char === '}') {
          if (braceStack.length === 0) {
            markers.push({
              startLineNumber: lineNum,
              startColumn: col + 1,
              endLineNumber: lineNum,
              endColumn: col + 2,
              message: "Syntax error: Unexpected closing curly brace '}' without opening match.",
              severity: 8,
            });
          } else {
            braceStack.pop();
          }
        }
      }

      // Check unclosed string literal on line
      if (inString) {
        markers.push({
          startLineNumber: lineNum,
          startColumn: lineText.length,
          endLineNumber: lineNum,
          endColumn: lineText.length + 1,
          message: 'Syntax error: Unclosed string or character literal.',
          severity: 8,
        });
      }

      // Check missing semicolon on statements
      const trimmed = lineText.trim();
      const needsSemicolon =
        trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(':') &&
        !trimmed.endsWith(',') &&
        !trimmed.startsWith('public class') &&
        !trimmed.startsWith('class ') &&
        !trimmed.startsWith('interface ') &&
        !trimmed.startsWith('import ') &&
        !trimmed.startsWith('package ') &&
        !trimmed.startsWith('@') &&
        !trimmed.startsWith('if') &&
        !trimmed.startsWith('else') &&
        !trimmed.startsWith('for') &&
        !trimmed.startsWith('while') &&
        !trimmed.startsWith('try') &&
        !trimmed.startsWith('catch') &&
        !trimmed.startsWith('finally') &&
        !trimmed.startsWith('switch');

      if (needsSemicolon && (trimmed.includes('=') || trimmed.includes('return ') || trimmed.startsWith('System.out.') || trimmed.includes('throws '))) {
        markers.push({
          startLineNumber: lineNum,
          startColumn: Math.max(1, lineText.length),
          endLineNumber: lineNum,
          endColumn: lineText.length + 1,
          message: "Syntax error: Missing semicolon ';' at end of statement.",
          severity: 8,
        });
      }
    });

    // Report any unclosed opening tokens
    parenStack.forEach((t) => {
      markers.push({
        startLineNumber: t.line,
        startColumn: t.col,
        endLineNumber: t.line,
        endColumn: t.col + 1,
        message: "Syntax error: Unclosed parenthesis '(' missing matching ')'.",
        severity: 8,
      });
    });

    braceStack.forEach((t) => {
      markers.push({
        startLineNumber: t.line,
        startColumn: t.col,
        endLineNumber: t.line,
        endColumn: t.col + 1,
        message: "Syntax error: Unclosed block '{' missing matching '}'.",
        severity: 8,
      });
    });

    bracketStack.forEach((t) => {
      markers.push({
        startLineNumber: t.line,
        startColumn: t.col,
        endLineNumber: t.line,
        endColumn: t.col + 1,
        message: "Syntax error: Unclosed array bracket '[' missing matching ']'.",
        severity: 8,
      });
    });

    // Check class declaration
    if (!currentCode.includes('class ')) {
      markers.push({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 5,
        message: "Compilation error: No Java class declared. A class declaration (e.g., 'public class Main') is required.",
        severity: 8,
      });
    }

    return markers;
  };

  // Perform live linting whenever code changes
  useEffect(() => {
    const timer = setTimeout(() => {
      const markers = validateJavaSyntax(code);
      setLiveErrors(markers);

      if (monacoRef.current && editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monacoRef.current.editor.setModelMarkers(model, 'java-live-linter', markers);
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [code]);

  // Handle Monaco onMount configuration
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Intercept Ctrl+Enter to Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Initial lint
    const markers = validateJavaSyntax(code);
    setLiveErrors(markers);
    const model = editor.getModel();
    if (model) {
      monaco.editor.setModelMarkers(model, 'java-live-linter', markers);
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Compiling and launching JVM sandbox...\n');
    setErrors(null);

    try {
      const res = await api.executeJava({
        code,
        class_name: 'Main',
        stdin: stdin || undefined,
      });

      setExecutionTimeMs(res.execution_time_ms);
      if (res.compiled) {
        setOutput(res.output || '[Process exited with code 0]');
        setErrors(res.errors || null);
        setActiveConsoleTab('output');
      } else {
        setOutput(res.output || '');
        setErrors(res.errors || 'Compilation failed. See compiler diagnostics above.');
        setActiveConsoleTab('errors');
      }
    } catch (err: any) {
      setErrors(err.message || 'Execution request failed. Ensure backend service is reachable.');
      setActiveConsoleTab('errors');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectTemplate = (key: string) => {
    setSelectedTemplateKey(key);
    if (CODE_TEMPLATES[key]) {
      setCode(CODE_TEMPLATES[key].code);
      setOutput(`Loaded template: ${CODE_TEMPLATES[key].title}\nReady to run.`);
      setErrors(null);
    }
  };

  const handleReset = () => {
    const tpl = CODE_TEMPLATES[selectedTemplateKey] || CODE_TEMPLATES.blank;
    setCode(tpl.code);
    setOutput('Code reset to template default.');
    setErrors(null);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Main.java';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleJumpToError = (marker: DiagnosticMarker) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(marker.startLineNumber);
      editorRef.current.setPosition({
        lineNumber: marker.startLineNumber,
        column: marker.startColumn,
      });
      editorRef.current.focus();
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Java Cloud IDE Workspace</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  JDK 21 Isolated Sandbox
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Strict No-Auto-Complete
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Practice writing raw Java code without relying on auto-suggestions. Live syntax diagnostics detect errors in real time.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Template Selector */}
          <div className="relative">
            <select
              value={selectedTemplateKey}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-sky-500 appearance-none font-medium cursor-pointer"
            >
              {Object.entries(CODE_TEMPLATES).map(([key, tpl]) => (
                <option key={key} value={key}>
                  [{tpl.company}] {tpl.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Font Size Selector */}
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:border-sky-500 font-mono"
            title="Font Size"
          >
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
          </select>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset to template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Download File */}
          <button
            onClick={handleDownloadFile}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Download Main.java"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Compile & Run Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {isRunning ? 'Compiling & Running...' : 'Compile & Run (Ctrl+Enter)'}
          </button>
        </div>
      </div>

      {/* Main IDE Workspace: Editor + Diagnostics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[620px]">
        {/* Monaco Editor Pane (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm dark:shadow-2xl min-h-[500px]">
          {/* File Header Bar */}
          <div className="bg-slate-100 dark:bg-slate-900 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <FileCode className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 ml-2" />
              <span className="font-bold text-slate-800 dark:text-slate-200">Main.java</span>
            </div>

            <div className="flex items-center gap-3">
              {liveErrors.length > 0 ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                  <AlertCircle className="w-3 h-3" />
                  {liveErrors.length} {liveErrors.length === 1 ? 'Error' : 'Errors'} while typing
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  No Syntax Errors
                </span>
              )}
            </div>
          </div>

          {/* Monaco Editor with STRICT NO-AUTOCOMPLETE Config */}
          <div className="flex-1 min-h-[460px] relative">
            <Editor
              height="100%"
              defaultLanguage="java"
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorDidMount}
              options={{
                fontSize: fontSize,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                lineNumbers: 'on',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                bracketPairColorization: { enabled: true },
                formatOnPaste: true,

                // STRICT NO-AUTOCOMPLETE CONFIGURATION (User Requirement)
                quickSuggestions: false,
                suggestOnTriggerCharacters: false,
                snippetSuggestions: 'none',
                tabCompletion: 'off',
                wordBasedSuggestions: 'off',
                acceptSuggestionOnEnter: 'off',
                suggest: {
                  showWords: false,
                  showSnippets: false,
                  showClasses: false,
                  showFunctions: false,
                  showKeywords: false,
                  showVariables: false,
                  showFields: false,
                  showModules: false,
                  showProperties: false,
                  showUnits: false,
                  showValues: false,
                  showConstants: false,
                  showEnums: false,
                  showEnumMembers: false,
                  showConstructors: false,
                  showInterfaces: false,
                  showMethods: false,
                  showReferences: false,
                  showFolders: false,
                  showTypeParameters: false,
                  showIssues: false,
                  showUsers: false,
                },
              }}
            />
          </div>

          {/* Status Bar */}
          <div className="bg-slate-100/90 dark:bg-slate-900/90 px-4 py-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span>UTF-8</span>
              <span>Java 21</span>
              <span>Spaces: 4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">● Real-time AST Engine Active</span>
            </div>
          </div>
        </div>

        {/* Right Output & Diagnostics Panel (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm dark:shadow-2xl">
          {/* Diagnostics Navigation Tabs */}
          <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveConsoleTab('output')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
                  activeConsoleTab === 'output'
                    ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Console Output
              </button>

              <button
                onClick={() => setActiveConsoleTab('errors')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
                  activeConsoleTab === 'errors'
                    ? 'border-rose-500 text-rose-600 dark:text-rose-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Live Errors ({liveErrors.length})
              </button>

              <button
                onClick={() => setActiveConsoleTab('stdin')}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-mono font-medium transition-colors border-b-2 ${
                  activeConsoleTab === 'stdin'
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Stdin Input
              </button>
            </div>

            {executionTimeMs !== null && (
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {executionTimeMs} ms
              </span>
            )}
          </div>

          {/* Console Tab Content */}
          <div className="flex-1 p-4 bg-slate-950 font-mono text-xs overflow-y-auto min-h-[350px]">
            {/* 1. Terminal Output View */}
            {activeConsoleTab === 'output' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <span className="text-slate-500 text-[11px]">$ java Main</span>
                  <button
                    onClick={() => setOutput('')}
                    className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed font-mono">
                  {output || '<No output returned>'}
                </pre>
                {errors && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                    <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-400">
                      <AlertCircle className="w-4 h-4" /> Execution / Compiler Diagnostics:
                    </div>
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">{errors}</pre>
                  </div>
                )}
              </div>
            )}

            {/* 2. Live Errors View (Shown while writing itself) */}
            {activeConsoleTab === 'errors' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <span className="text-slate-400 font-bold text-xs">
                    Real-Time Syntax Diagnostics ({liveErrors.length})
                  </span>
                  <span className="text-[10px] text-slate-500">Click any issue to jump to line</span>
                </div>

                {liveErrors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mb-2" />
                    <p className="text-sm font-semibold text-slate-400">Clean Syntax!</p>
                    <p className="text-xs text-slate-600 mt-1">No bracket mismatches, unclosed quotes, or missing semicolons.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {liveErrors.map((marker, i) => (
                      <div
                        key={i}
                        onClick={() => handleJumpToError(marker)}
                        className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-800/40 hover:border-rose-500/60 cursor-pointer transition-all flex items-start gap-2.5 group"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-rose-300 font-mono">
                              Line {marker.startLineNumber}, Col {marker.startColumn}
                            </span>
                            <span className="text-[10px] text-rose-400/80 group-hover:text-rose-200 underline">
                              Jump to code →
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5 leading-normal">{marker.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Stdin View */}
            {activeConsoleTab === 'stdin' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1 text-xs">
                    Standard Input (System.in):
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Data entered here will be passed directly to Scanner / BufferedReader during execution.
                  </p>
                  <textarea
                    value={stdin}
                    onChange={(e) => setStdin(e.target.value)}
                    rows={6}
                    placeholder="Enter input values separated by spaces or newlines..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-bold text-slate-300">Example Usage:</span>
                  <pre className="mt-1 text-emerald-400 font-mono">
{`Scanner sc = new Scanner(System.in);
String str = sc.next();
int num = sc.nextInt();`}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* MNC Guidance Tip */}
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="text-slate-800 dark:text-slate-200">Interview Tip:</strong> Top MNCs like Google, Amazon, and Meta test on raw coding without IDE autocompletions. Practice typing exact syntax!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
