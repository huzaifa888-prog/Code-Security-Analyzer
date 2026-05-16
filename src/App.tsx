import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Search, 
  Zap, 
  Terminal, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Code,
  FileText,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { securityService, AnalysisResult } from './services/geminiService.ts';

export default function App() {
  const [policy, setPolicy] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'input' | 'result'>('input');
  
  const handleAnalyze = async () => {
    if (!policy.trim() || !code.trim()) {
      setError('Please provide both a security policy and code to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const analysis = await securityService.analyze(policy, code);
      setResult(analysis);
      setActiveTab('result');
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check your credentials or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 76) return 'text-security-accent';
    if (score >= 51) return 'text-security-info';
    if (score >= 21) return 'text-security-warning';
    return 'text-security-danger';
  };

  const reset = () => {
    setResult(null);
    setActiveTab('input');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-mono text-sm">
      {/* Header */}
      <header className="border-b border-security-border bg-security-panel px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-security-accent flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-medium text-white">
              <span className="text-security-accent">Security</span> Analyzer
            </h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-none mt-1">
              v4.0.0-STRICT
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-security-inner border border-security-border">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Mode: Strict Policy</span>
          </div>
          {result && (
            <button 
              onClick={reset}
              className="p-2 rounded-lg hover:bg-security-border text-gray-400 transition-colors"
              title="Reset Analysis"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-73px)] relative overflow-hidden">
        {/* Visual Scanner Background Line */}
        {isLoading && (
          <motion.div 
            className="scanner-line z-20"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Sidebar / Tabs */}
        <div className="w-full lg:w-16 border-r border-security-border bg-security-bg flex lg:flex-col items-center py-6 gap-8 px-4 lg:px-0">
          <div className="space-y-8 flex lg:flex-col items-center">
            <button 
              onClick={() => setActiveTab('input')}
              className={`p-2 rounded transition-all duration-200 ${activeTab === 'input' ? 'text-security-accent' : 'text-gray-600 hover:text-white'}`}
            >
              <Terminal className="w-6 h-6" />
            </button>
            <button 
              onClick={() => activeTab === 'result' || result ? setActiveTab('result') : null}
              disabled={!result && !isLoading}
              className={`p-2 rounded transition-all duration-200 ${activeTab === 'result' ? 'text-security-accent' : 'text-gray-600 hover:text-white disabled:opacity-20'}`}
            >
              <Search className="w-6 h-6" />
            </button>
            <div className="w-6 h-px bg-security-border hidden lg:block" />
            <div className="w-6 h-6 border-2 border-gray-700 rounded-full hidden lg:block" />
            <div className="w-6 h-6 border-b-2 border-gray-700 hidden lg:block" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative bg-security-bg overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'input' ? (
              <motion.div 
                key="input-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="h-full grid grid-rows-[1fr_2fr] lg:grid-rows-none lg:grid-cols-2 p-6 gap-6"
              >
                {/* Policy Input */}
                <div className="flex flex-col gap-3 min-h-[200px]">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileText className="w-4 h-4" />
                    <span className="uppercase text-[10px] font-bold tracking-widest">Active Security Policy</span>
                  </div>
                  <textarea
                    value={policy}
                    onChange={(e) => setPolicy(e.target.value)}
                    placeholder="Enter security guidelines..."
                    className="flex-1 bg-security-inner border border-security-border rounded p-4 text-gray-400 italic outline-none focus:border-security-accent/30 resize-none transition-colors code-editor"
                  />
                </div>

                {/* Code Input */}
                <div className="flex flex-col gap-3 min-h-[300px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Code className="w-4 h-4" />
                      <span className="uppercase text-[10px] font-bold tracking-widest">Project Scope</span>
                    </div>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-security-danger text-[10px] flex items-center gap-1"
                      >
                        <AlertCircle className="w-3 h-3" />
                        {error}
                      </motion.div>
                    )}
                  </div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste the source code..."
                    className="flex-1 bg-security-inner border border-security-border rounded p-4 text-gray-300 outline-none focus:border-security-accent/30 font-mono resize-none transition-colors code-editor"
                  />
                  
                  <button 
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="mt-4 w-full bg-security-accent hover:bg-opacity-90 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all"
                  >
                    {isLoading ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        Initialize Analysis
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="result-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="h-full p-6 overflow-y-auto code-editor"
              >
                {result ? (
                  <div className="max-w-4xl mx-auto space-y-8 pb-12">
                    {/* Hero Result Section */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 border border-security-border rounded overflow-hidden">
                      <div className="md:col-span-3 bg-security-inner p-8 flex flex-col items-center justify-center text-center relative border-r border-security-border">
                        {result.compliant ? (
                          <div className="w-16 h-16 rounded-full bg-security-accent/10 flex items-center justify-center mb-6">
                            <ShieldCheck className="w-8 h-8 text-security-accent" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-security-danger/10 flex items-center justify-center mb-6">
                            <ShieldAlert className="w-8 h-8 text-security-danger" />
                          </div>
                        )}
                        
                        <h2 className="text-2xl font-medium text-white mb-2">
                          {result.compliant ? 'Scan Compliant' : 'Non-Compliant'}
                        </h2>
                        <p className="text-xs text-gray-500 max-w-sm uppercase tracking-wider font-semibold">
                          Neural analysis complete. Result: {result.compliant ? 'PASSED' : 'FAILED'}
                        </p>
                      </div>

                      <div className="md:col-span-2 bg-security-panel p-8 flex flex-col items-center justify-center relative">
                        <div className="text-center">
                          <span className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-4 block font-bold">Security Score</span>
                          <div className="text-6xl font-light tracking-tighter">
                            <span className={result.score < 50 ? 'text-security-danger' : 'text-security-accent'}>
                              {result.score}
                            </span>
                            <span className="text-xl text-gray-700 ml-1">/100</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Issues */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1 border-b border-security-border pb-2">
                          <h3 className="uppercase text-[10px] font-bold tracking-widest text-gray-500">Detected Issues</h3>
                        </div>
                        {result.issues.length > 0 ? (
                          <div className="space-y-4">
                            {result.issues.map((issue, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx}
                                className="bg-[#15151A] border-l border-security-danger p-4 rounded flex gap-3"
                              >
                                <span className="text-security-danger">🚨</span>
                                <div>
                                  <p className="text-xs font-semibold text-red-200 uppercase tracking-wide mb-1">Policy Violation</p>
                                  <p className="text-xs text-gray-400 leading-relaxed italic">"{issue}"</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-security-panel border border-security-border p-8 rounded flex flex-col items-center justify-center text-gray-600 italic text-xs">
                            <CheckCircle2 className="w-5 h-5 mb-2 opacity-30" />
                            No policy violations found
                          </div>
                        )}
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-center gap-2 px-1 border-b border-security-border pb-2">
                          <h3 className="uppercase text-[10px] font-bold tracking-widest text-gray-500">Remediation Path</h3>
                        </div>
                        {result.suggestions.length > 0 ? (
                          <div className="space-y-4">
                            {result.suggestions.map((suggestion, idx) => (
                              <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: (idx + result.issues.length) * 0.1 }}
                                key={idx}
                                className="bg-[#15151A] border-l border-security-accent p-4 rounded flex gap-3"
                              >
                                <span className="text-security-accent">•</span>
                                <p className="text-xs text-gray-400 leading-relaxed">{suggestion}</p>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-security-panel border border-security-border p-8 rounded flex flex-col items-center justify-center text-gray-600 italic text-xs">
                            Verification successful
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600 italic">
                    Scan in progress...
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info Rail */}
      <footer className="border-t border-security-border bg-security-panel px-6 py-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500">
        <div className="flex gap-4">
          <span>Encrypted Session</span>
          <span>Node ID: AI-SCAN-772</span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-security-accent" /> Neural Core Active</span>
          <span>© 2026 G-Studio Cybersec</span>
        </div>
      </footer>
    </div>
  );
}
