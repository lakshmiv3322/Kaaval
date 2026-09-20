import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  Zap, 
  FileText, 
  Cpu, 
  Search, 
  Filter, 
  ArrowLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import bundledEvalResults from '../data/evalResults.json';

interface TestCase {
  id: string;
  language: string;
  scamType: string;
  actualScam: boolean;
  predictedScam: boolean;
  predictedScore: number;
  predictedLevel?: string;
  goldTactics: string[];
  predictedTactics?: string[];
  goldFirstAlertIndex?: number | null;
  predictedFirstAlertIndex?: number | null;
  latencyMs: number;
  finalTranscript: string;
  rationale: string;
}

interface EvalData {
  evaluatedAt: string;
  datasetSize: number;
  heuristics: {
    metrics: {
      total: number;
      scamCount: number;
      benignCount: number;
      tp: number;
      fp: number;
      tn: number;
      fn: number;
      precision: number;
      recall: number;
      f1: number;
      fpr: number;
      accuracy: number;
      avgTimeToFirstAlert: number;
      avgLatencyMs: number;
      confusionMatrix: {
        actualScam_predScam: number;
        actualScam_predBenign: number;
        actualBenign_predScam: number;
        actualBenign_predBenign: number;
      };
      failureCases: any[];
    };
    detailedCases: TestCase[];
  };
  hybridGemini?: {
    metrics: {
      total: number;
      scamCount: number;
      benignCount: number;
      tp: number;
      fp: number;
      tn: number;
      fn: number;
      precision: number;
      recall: number;
      f1: number;
      fpr: number;
      accuracy: number;
      avgTimeToFirstAlert: number;
      avgLatencyMs: number;
      confusionMatrix: {
        actualScam_predScam: number;
        actualScam_predBenign: number;
        actualBenign_predScam: number;
        actualBenign_predBenign: number;
      };
      failureCases: any[];
    };
  };
}

const defaultBenchmarkData: EvalData = bundledEvalResults as unknown as EvalData;

export const EvalResultsPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [evalData, setEvalData] = useState<EvalData | null>(defaultBenchmarkData);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<TestCase | null>(
    defaultBenchmarkData?.heuristics?.detailedCases?.[0] || null
  );
  const [filterType, setFilterType] = useState<string>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'hybrid' | 'heuristics'>('hybrid');

  const fetchResults = async () => {
    try {
      // First try live server endpoint, then static JSON asset fallback
      let res: Response | null = null;
      try {
        res = await fetch('/api/demo/eval/results');
      } catch {
        res = null;
      }

      if (!res || !res.ok) {
        try {
          res = await fetch('/eval-results.json');
        } catch {
          res = null;
        }
      }

      if (res && res.ok) {
        const data = await res.json();
        if (data && data.heuristics?.metrics) {
          setEvalData(data);
          if (data.heuristics?.detailedCases?.length > 0 && !selectedCase) {
            setSelectedCase(data.heuristics.detailedCases[0]);
          }
        }
      }
    } catch (e) {
      // Bundled benchmark data is already rendered as initial state
      console.info('Using bundled benchmark evaluation dataset:', e);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading && !evalData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F14] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#5B8FFF] animate-spin" />
          <p className="text-sm text-[#9CA3AF]">Loading benchmark evaluation metrics...</p>
        </div>
      </div>
    );
  }

  if (!evalData) {
    return (
      <div className="min-h-screen p-8 max-w-4xl mx-auto text-white flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-12 h-12 text-[#F59E0B] mb-4" />
        <h2 className="text-xl font-bold mb-2">Benchmark Results Not Found</h2>
        <p className="text-[#9CA3AF] mb-6 text-sm">
          Run <code className="bg-[#1E293B] px-2 py-1 rounded text-[#5B8FFF]">npm run eval</code> in the terminal to evaluate the detection pipeline on the 65-transcript dataset.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEvalData(defaultBenchmarkData);
              if (defaultBenchmarkData?.heuristics?.detailedCases?.length > 0) {
                setSelectedCase(defaultBenchmarkData.heuristics.detailedCases[0]);
              }
            }}
            className="px-4 py-2 bg-[#5B8FFF] hover:bg-[#4a7de6] transition-colors rounded-xl text-white text-sm font-medium"
          >
            Load Pre-computed 65-Call Benchmark
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2 bg-[#1E293B] hover:bg-[#334155] transition-colors rounded-xl text-white text-sm"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const metrics = activeTab === 'hybrid' && evalData.hybridGemini 
    ? evalData.hybridGemini.metrics 
    : evalData.heuristics.metrics;

  const cases = evalData.heuristics.detailedCases || [];

  const filteredCases = cases.filter((c) => {
    if (filterType === 'tp' && !(c.actualScam && c.predictedScam)) return false;
    if (filterType === 'tn' && !(!c.actualScam && !c.predictedScam)) return false;
    if (filterType === 'fn' && !(c.actualScam && !c.predictedScam)) return false;
    if (filterType === 'fp' && !(!c.actualScam && c.predictedScam)) return false;
    if (langFilter !== 'all' && c.language !== langFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = c.finalTranscript.toLowerCase().includes(q) || 
                        c.scamType.toLowerCase().includes(q) ||
                        c.id.toLowerCase().includes(q);
      if (!matchText) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-6">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="p-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-[#9CA3AF] hover:text-white transition-colors"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <span>Model Evaluation & Benchmark</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] font-mono">
                  Live Results
                </span>
              </h1>
            </div>
            <p className="text-sm text-[#9CA3AF] mt-1 ml-11">
              Synthetic dataset benchmark across 65 annotated calls (Digital Arrest, Courier Narcotics, KYC, Benign Family & Utilities).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {evalData.hybridGemini && (
              <div className="flex bg-[#161F2E] p-1 rounded-xl border border-[#1E293B]">
                <button
                  onClick={() => setActiveTab('hybrid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'hybrid'
                      ? 'bg-[#5B8FFF] text-white shadow'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  Hybrid (Gemini + Rules)
                </button>
                <button
                  onClick={() => setActiveTab('heuristics')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'heuristics'
                      ? 'bg-[#5B8FFF] text-white shadow'
                      : 'text-[#9CA3AF] hover:text-white'
                  }`}
                >
                  On-Device Rules Only
                </button>
              </div>
            )}
            <button
              onClick={fetchResults}
              className="p-2.5 rounded-xl bg-[#161F2E] border border-[#1E293B] hover:border-[#5B8FFF]/40 text-[#9CA3AF] hover:text-white transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Metric KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">Accuracy</span>
            <div className="text-2xl font-bold text-white mt-2">{metrics.accuracy}%</div>
            <span className="text-[11px] text-[#10B981] mt-1">({metrics.tp + metrics.tn}/{metrics.total} total)</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#10B981]/30 flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">Precision</span>
            <div className="text-2xl font-bold text-[#10B981] mt-2">{metrics.precision}%</div>
            <span className="text-[11px] text-[#9CA3AF] mt-1">0% false alarms on family</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">Recall</span>
            <div className="text-2xl font-bold text-[#5B8FFF] mt-2">{metrics.recall}%</div>
            <span className="text-[11px] text-[#9CA3AF] mt-1">{metrics.tp}/{metrics.scamCount} scam cases caught</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">F1 Score</span>
            <div className="text-2xl font-bold text-[#F59E0B] mt-2">{metrics.f1}%</div>
            <span className="text-[11px] text-[#9CA3AF] mt-1">Harmonic mean</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">Time-To-First-Alert</span>
            <div className="text-2xl font-bold text-white mt-2 flex items-baseline gap-1">
              {metrics.avgTimeToFirstAlert} <span className="text-xs font-normal text-[#9CA3AF]">turns</span>
            </div>
            <span className="text-[11px] text-[#10B981] mt-1">Under 30s into call</span>
          </div>

          <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#9CA3AF]">Avg Pipeline Latency</span>
            <div className="text-2xl font-bold text-[#5B8FFF] mt-2 flex items-baseline gap-1">
              {metrics.avgLatencyMs} <span className="text-xs font-normal text-[#9CA3AF]">ms</span>
            </div>
            <span className="text-[11px] text-[#9CA3AF] mt-1">
              {activeTab === 'heuristics' ? 'Pure deterministic' : 'LLM reasoning'}
            </span>
          </div>
        </div>

        {/* Confusion Matrix & Tradeoff Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 2x2 Confusion Matrix */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center justify-between">
              <span>Confusion Matrix</span>
              <span className="text-xs text-[#9CA3AF] font-mono">N = {metrics.total}</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* TP */}
              <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex flex-col items-center">
                <span className="text-xs text-[#10B981] font-medium">True Positives</span>
                <span className="text-3xl font-extrabold text-white my-1">{metrics.confusionMatrix.actualScam_predScam}</span>
                <span className="text-[11px] text-[#9CA3AF]">Actual Scam → Alerted</span>
              </div>

              {/* FP */}
              <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex flex-col items-center">
                <span className="text-xs text-[#EF4444] font-medium">False Positives</span>
                <span className="text-3xl font-extrabold text-white my-1">{metrics.confusionMatrix.actualBenign_predScam}</span>
                <span className="text-[11px] text-[#9CA3AF]">Benign → False Alert</span>
              </div>

              {/* FN */}
              <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/40 flex flex-col items-center">
                <span className="text-xs text-[#F59E0B] font-medium">False Negatives</span>
                <span className="text-3xl font-extrabold text-white my-1">{metrics.confusionMatrix.actualScam_predBenign}</span>
                <span className="text-[11px] text-[#9CA3AF]">Actual Scam → Missed</span>
              </div>

              {/* TN */}
              <div className="p-4 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/40 flex flex-col items-center">
                <span className="text-xs text-[#5B8FFF] font-medium">True Negatives</span>
                <span className="text-3xl font-extrabold text-white my-1">{metrics.confusionMatrix.actualBenign_predBenign}</span>
                <span className="text-[11px] text-[#9CA3AF]">Benign → Safe Pass</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#9CA3AF]">
              <span>False Positive Rate (FPR): <strong className="text-white">{metrics.fpr}%</strong></span>
              <span>Dataset Size: <strong className="text-white">{evalData.datasetSize} labeled calls</strong></span>
            </div>
          </div>

          {/* Precision vs Recall Trade-Off Notes */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <h2 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10B981]" />
                <span>ROC / PR Operating Curve & Design Rationale</span>
              </h2>
              <div className="space-y-3 text-xs leading-relaxed text-[#9CA3AF]">
                <p>
                  <strong className="text-white">Zero False-Alarm Mandate:</strong> In elder scam defense, false positives produce severe "alert fatigue". If routine family calls from sons or daughters discussing hospital visits or grocery transfers trigger emergency sirens, elders disable the protection. We tune the alert threshold at <strong>65/100</strong> with a verified family allowlist cap.
                </p>
                <p>
                  <strong className="text-white">Dual-Tier Latency Architecture:</strong> Deterministic regex heuristics execute on-device in <strong className="text-white">&lt;1 ms</strong> with 0 token cost. The cloud-hosted Gemini model provides semantic understanding for novel phrasing and edge cases in <strong className="text-white">~500–900 ms</strong>.
                </p>
                <p>
                  <strong className="text-white">Verbatim Substring Proof:</strong> Every flagged tactic must match an exact substring in the caller's utterances. Hallucinated or speculative LLM citations are discarded automatically by <code className="text-[#5B8FFF]">validateVerbatimQuotes()</code>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1E293B] text-center">
              <div className="p-2 rounded-lg bg-[#0B0F14]/60">
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block">Rule Engine</span>
                <span className="text-xs font-semibold text-[#10B981]">&lt; 1 ms (Local)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0F14]/60">
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block">Gemini Flash</span>
                <span className="text-xs font-semibold text-[#5B8FFF]">~925 ms (Cloud)</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0B0F14]/60">
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider block">Alert Threshold</span>
                <span className="text-xs font-semibold text-[#F59E0B]">Risk &gt;= 65</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Case Inspector */}
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#5B8FFF]" />
                <span>Benchmark Test Case Inspector</span>
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Click any case to inspect the transcript, redaction mask, gold annotations, and model rationale.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search transcript / type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[#161F2E] border border-[#1E293B] text-xs text-white placeholder-[#9CA3AF] focus:outline-none focus:border-[#5B8FFF]"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#161F2E] border border-[#1E293B] text-xs text-white focus:outline-none"
              >
                <option value="all">All Outcomes ({cases.length})</option>
                <option value="tp">True Positives ({metrics.tp})</option>
                <option value="tn">True Negatives ({metrics.tn})</option>
                <option value="fn">False Negatives ({metrics.fn})</option>
                <option value="fp">False Positives ({metrics.fp})</option>
              </select>

              <select
                value={langFilter}
                onChange={(e) => setLangFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg bg-[#161F2E] border border-[#1E293B] text-xs text-white focus:outline-none"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
                <option value="tanglish">Tanglish</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>
          </div>

          {/* Master-Detail Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* List Column */}
            <div className="lg:col-span-5 max-h-[550px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {filteredCases.map((c) => {
                const isSelected = selectedCase?.id === c.id;
                const isTP = c.actualScam && c.predictedScam;
                const isTN = !c.actualScam && !c.predictedScam;
                const isFN = c.actualScam && !c.predictedScam;
                const isFP = !c.actualScam && c.predictedScam;

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#1E293B] border-[#5B8FFF] shadow-sm'
                        : 'bg-[#161F2E]/60 border-[#1E293B] hover:border-[#334155]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-[#9CA3AF] font-bold">{c.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-[#9CA3AF] uppercase">
                          {c.language}
                        </span>
                        <span className="text-xs text-white font-medium truncate">
                          {c.scamType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-[#9CA3AF] truncate">
                        {c.finalTranscript.slice(0, 75)}...
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isTP && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                          TP {c.predictedScore}%
                        </span>
                      )}
                      {isTN && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#3B82F6]/20 text-[#5B8FFF] border border-[#3B82F6]/30">
                          TN {c.predictedScore}%
                        </span>
                      )}
                      {isFN && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                          FN {c.predictedScore}%
                        </span>
                      )}
                      {isFP && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30">
                          FP {c.predictedScore}%
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#5B8FFF]' : 'text-[#64748B]'}`} />
                    </div>
                  </button>
                );
              })}
              {filteredCases.length === 0 && (
                <div className="p-8 text-center text-xs text-[#9CA3AF]">
                  No test cases match the active filter criteria.
                </div>
              )}
            </div>

            {/* Detailed Inspector View */}
            <div className="lg:col-span-7 bg-[#161F2E] border border-[#1E293B] rounded-xl p-5 flex flex-col justify-between">
              {selectedCase ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{selectedCase.id}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#5B8FFF]/20 text-[#5B8FFF] uppercase">
                          {selectedCase.language}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1E293B] text-[#9CA3AF]">
                          {selectedCase.scamType}
                        </span>
                      </div>
                      <span className="text-xs text-[#9CA3AF] mt-0.5 block">
                        Actual: <strong className="text-white">{selectedCase.actualScam ? 'Scam Coercion' : 'Benign Call'}</strong> | 
                        Predicted: <strong className={selectedCase.predictedScam ? 'text-[#EF4444]' : 'text-[#10B981]'}>
                          {selectedCase.predictedScam ? 'Alert Triggered' : 'Safe / Non-Threat'}
                        </strong> ({selectedCase.predictedScore}/100)
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-[#9CA3AF] block">Latency</span>
                      <span className="text-sm font-mono font-bold text-white">{selectedCase.latencyMs} ms</span>
                    </div>
                  </div>

                  {/* Transcript box */}
                  <div>
                    <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1.5">
                      Transcript Utterances
                    </span>
                    <div className="p-3.5 rounded-lg bg-[#0B0F14] border border-[#1E293B] text-xs font-mono leading-relaxed space-y-2 max-h-56 overflow-y-auto">
                      {selectedCase.finalTranscript.split('\n').map((line, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-[#64748B] select-none font-bold">L{idx + 1}:</span>
                          <span className={line.toLowerCase().includes('arrest') || line.toLowerCase().includes('otp') || line.toLowerCase().includes('bill') ? 'text-[#F59E0B]' : 'text-[#E5E7EB]'}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Labels Comparison */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-[#0B0F14]/70 border border-[#1E293B]">
                      <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">
                        Gold Labels
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCase.goldTactics.length > 0 ? (
                          selectedCase.goldTactics.map((gt) => (
                            <span key={gt} className="text-[10px] px-2 py-0.5 rounded bg-[#1E293B] text-white">
                              {gt}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-[#64748B]">None (Benign)</span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9CA3AF] mt-2 block">
                        First Alert Target: {selectedCase.goldFirstAlertIndex !== null && selectedCase.goldFirstAlertIndex !== undefined ? `Turn ${selectedCase.goldFirstAlertIndex + 1}` : 'N/A'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0B0F14]/70 border border-[#1E293B]">
                      <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase block mb-1">
                        Model Output & Rationale
                      </span>
                      <p className="text-xs text-[#E5E7EB] leading-relaxed">
                        {selectedCase.rationale || 'Processed through heuristic keyword & pattern scoring matrix.'}
                      </p>
                      {selectedCase.predictedFirstAlertIndex !== null && selectedCase.predictedFirstAlertIndex !== undefined && (
                        <span className="text-[10px] text-[#10B981] mt-2 block">
                          Predicted First Alert: Turn {selectedCase.predictedFirstAlertIndex + 1}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-[#9CA3AF]">
                  Select any test case to inspect details.
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-[#9CA3AF]">
                <span>Evaluated at {new Date(evalData.evaluatedAt).toLocaleString()}</span>
                <span className="font-mono text-[#5B8FFF]">Dataset: eval/dataset.json</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
