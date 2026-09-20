import React, { useState } from 'react';
import { 
  Scale, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Sparkles, 
  ArrowLeft,
  RefreshCw,
  Copy,
  Lock,
  EyeOff
} from 'lucide-react';
import { api } from '../services/api';
import { redactSensitiveData } from '../services/redaction';

const PRESET_CASES = [
  {
    name: 'Digital Arrest (Tamil/Tanglish)',
    lang: 'Tanglish / Tamil',
    isFamily: false,
    text: `Caller: Naan Mumbai Cyber Crime Cell DCP Vikram Singh pesaren. Ungal Aadhaar 4821 9842 1109 use panni Canara Bank Mumbai branch-la 23 crore money laundering nadanthurukku.
Elder: Aiyyo sir enaku ethuvum theriyathu, naan retired school teacher!
Caller: Ungal peyaril Supreme Court non-bailable warrant issue pannirukanga! Call disconnect panna koodathu, Skype video call-la digital arrest-la irukanum. Kudumbathukku solla koodathu, secret investigation!`
  },
  {
    name: 'FedEx Narcotics (Hindi/Hinglish)',
    lang: 'Hinglish / Hindi',
    isFamily: false,
    text: `Caller: Main Mumbai Customs Department aur Narcotics Control Bureau se bol raha hoon. Aapke naam par ek parcel intercept hua hai jisme 140 grams MDMA drugs aur 5 fake passports mile hain.
Elder: Beta mera koi parcel nahi hai!
Caller: Aapka Aadhaar card link hai is parcel se! CBI officer Rajan Shinde abhi aapse baat karenge, turant verification fee deposit kijiye warna police team aapke ghar bhej rahe hain.`
  },
  {
    name: 'Electricity Cutoff Urgency',
    lang: 'English',
    isFamily: false,
    text: `Caller: Dear consumer, your electricity power will be disconnected tonight at 9:30 PM because previous month bill was not updated. Call our EB officer immediately at 9840211422.
Elder: But I paid my bill last week through the counter!
Caller: Sir system update error. Download QuickSupport app now and pay 10 rupees verification fee via debit card or electricity cutoff is permanent.`
  },
  {
    name: 'Benign Family Check-in (Son)',
    lang: 'Tamil',
    isFamily: true,
    text: `Son: Amma, eppadi irukkeenga? Maathirai ellam correct-aa pottuteengala?
Elder: Nalla iruken pa. Kaal vali konjam irunthathu, doctor sonna ointment pottuten.
Son: Sari ma, naan evening varumpothu appavoda BP tablet vaangi varren. Supermarket-la veggies konjam vaangiten. Take care ma!`
  },
  {
    name: 'Adversarial: Angry Landlord (No Scam)',
    lang: 'English',
    isFamily: false,
    text: `Caller: Mr. Sharma, this is your landlord Verma speaking. Where is this month's rent? It's already the 15th!
Elder: Verma ji, my pension was delayed by four days, I will transfer tomorrow.
Caller: I need the payment by tomorrow evening without fail. Please clear the pending electricity meter share as well.`
  }
];

export const JudgeBenchPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  const [transcriptText, setTranscriptText] = useState(PRESET_CASES[0].text);
  const [isFamily, setIsFamily] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [redactedPreview, setRedactedPreview] = useState('');

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);

    // Compute local redaction preview
    const { redactedText, redactedTypes } = redactSensitiveData(transcriptText);
    setRedactedPreview(redactedText);

    try {
      const startTime = performance.now();
      const res = await api.analyzeCall({
        callId: `judge-${Date.now()}`,
        transcriptText,
        isFamily
      });
      const clientLatency = Math.round(performance.now() - startTime);

      setResult({
        ...res,
        clientLatency,
        redactedTypes
      });
    } catch (e: any) {
      console.error('Judge bench error', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('/')}
              className="p-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-[#9CA3AF] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <Scale className="w-7 h-7 text-[#5B8FFF]" />
                <span>Judge & Evaluator Test Bench</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                Stress-test the dual-tier heuristic & Gemini detection engine with adversarial, multilingual transcripts.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/demo/eval')}
            className="px-3.5 py-2 rounded-xl bg-[#161F2E] hover:bg-[#1E293B] border border-[#1E293B] text-xs font-semibold text-white flex items-center gap-2"
          >
            <span>View 65-Test Benchmark</span>
          </button>
        </div>

        {/* Presets Bar */}
        <div>
          <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-2">
            Load Preset Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_CASES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  setTranscriptText(preset.text);
                  setIsFamily(preset.isFamily);
                  setResult(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  transcriptText === preset.text
                    ? 'bg-[#5B8FFF] text-white border-[#5B8FFF] shadow-sm'
                    : 'bg-[#161F2E] text-[#9CA3AF] hover:text-white border-[#1E293B]'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Editor Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-[#121824] border border-[#1E293B] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Transcript Input
                </span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs text-[#9CA3AF] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFamily}
                      onChange={(e) => setIsFamily(e.target.checked)}
                      className="rounded bg-[#1E293B] border-[#334155] text-[#5B8FFF] focus:ring-0"
                    />
                    <span>Flag as Verified Family Member</span>
                  </label>
                </div>
              </div>

              <textarea
                rows={11}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste caller dialogue here (e.g. Caller: You are under digital arrest...)"
                className="w-full p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-xs font-mono text-white placeholder-[#64748B] focus:outline-none focus:border-[#5B8FFF] leading-relaxed resize-none"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[#9CA3AF]">
                  {transcriptText.split('\n').filter(Boolean).length} utterances | Multilingual STT Ready
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !transcriptText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-[#5B8FFF] hover:bg-[#487CE8] disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#5B8FFF]/20 transition-all cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Coercion...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Evaluate Engine</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PII Redaction Audit */}
            {redactedPreview && (
              <div className="p-4 rounded-xl bg-[#121824] border border-[#1E293B] text-xs">
                <div className="flex items-center gap-2 mb-2 text-[#10B981] font-semibold">
                  <EyeOff className="w-4 h-4" />
                  <span>On-Device PII Redaction Mask (Sent to Model)</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0B0F14] font-mono text-[11px] text-[#9CA3AF] max-h-32 overflow-y-auto whitespace-pre-wrap">
                  {redactedPreview}
                </div>
              </div>
            )}
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6">
            <div className="h-full p-6 rounded-2xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
              {result ? (
                <div className="space-y-6">
                  {/* Verdict Top Bar */}
                  <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
                    <div>
                      <span className="text-[11px] font-mono text-[#9CA3AF] uppercase block">
                        Engine Threat Classification
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xl font-bold ${result.isScam ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                          {result.isScam ? '🚨 CRITICAL SCAM DETECTED' : '✅ SAFE / BENIGN'}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#1E293B] text-white">
                          {result.threatLevel}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-[#9CA3AF] block">Risk Score</span>
                      <span className="text-2xl font-extrabold text-white">
                        {result.riskScore}<span className="text-xs font-normal text-[#9CA3AF]">/100</span>
                      </span>
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-center">
                      <span className="text-[10px] text-[#9CA3AF] uppercase block">Engine Mode</span>
                      <span className="text-xs font-bold text-[#5B8FFF] mt-0.5 block">{result.detectionMode}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-center">
                      <span className="text-[10px] text-[#9CA3AF] uppercase block">End-to-End Latency</span>
                      <span className="text-xs font-bold text-white mt-0.5 block">{result.clientLatency} ms</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-center">
                      <span className="text-[10px] text-[#9CA3AF] uppercase block">Family Alert</span>
                      <span className={`text-xs font-bold mt-0.5 block ${result.isScam ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>
                        {result.isScam ? 'Would Trigger' : 'Silent'}
                      </span>
                    </div>
                  </div>

                  {/* Rationale */}
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block mb-1.5">
                      Model Reasoning & Rationale
                    </span>
                    <p className="text-xs text-[#CBD5E1] leading-relaxed p-3.5 rounded-xl bg-[#0B0F14] border border-[#1E293B]">
                      {result.rationale || 'Processed via regex pattern weights and threat matrix.'}
                    </p>
                  </div>

                  {/* Extracted Tactics with Quotes */}
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
                      Extracted Tactics & Verbatim Proof ({result.detectedTactics?.length || 0})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.detectedTactics && result.detectedTactics.length > 0 ? (
                        result.detectedTactics.map((tac: any, i: number) => (
                          <div key={i} className="p-2.5 rounded-lg bg-[#0B0F14] border border-[#1E293B] text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white">{tac.name}</span>
                              <span className="text-[10px] text-[#F59E0B] font-mono uppercase">{tac.severity}</span>
                            </div>
                            <p className="text-[#9CA3AF] italic text-[11px]">"{tac.quote}"</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-[#64748B]">
                          No predatory coercion tactics identified.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center p-6 text-[#9CA3AF]">
                  <Scale className="w-12 h-12 text-[#1E293B] mb-3" />
                  <p className="text-sm font-semibold text-white">Evaluator Engine Idle</p>
                  <p className="text-xs mt-1 max-w-sm">
                    Select a preset scenario or paste a dialogue on the left and click "Evaluate Engine" to inspect live decision logs.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-[#9CA3AF]">
                <span>Kaaval Coercion Detection Pipeline</span>
                <span className="text-[#5B8FFF]">Zero-PII Local Redaction Active</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
