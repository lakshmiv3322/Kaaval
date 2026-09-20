import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  Trash2, 
  FileCheck2, 
  ArrowLeft,
  ServerOff,
  Scale,
  CheckCircle2
} from 'lucide-react';

export const PrivacyPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Privacy Architecture & Zero-PII Guarantee
              </h1>
              <p className="text-sm text-[#9CA3AF] mt-1">
                How Kaaval protects elder dignity and constitutional privacy rights while detecting fraud.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/20 flex items-center justify-center text-[#10B981] mb-4">
              <EyeOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. On-Device PII Redaction</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Before any utterance leaves the device, deterministic regular expressions inspect and mask 12-digit Aadhaar numbers, 16-digit debit/credit card numbers, bank account numbers, 6-digit OTPs, and phone numbers.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F14] font-mono text-[11px] text-[#CBD5E1]">
              "Aadhaar 4821 9842 1109" → <span className="text-[#10B981] font-bold">[AADHAAR_REDACTED]</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/20 flex items-center justify-center text-[#5B8FFF] mb-4">
              <ServerOff className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Zero Audio Disk Storage</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Kaaval never saves raw phone call audio to hard disk or cloud object storage. Audio streams in 2-second volatile memory buffers strictly for speech-to-text tokenization and is immediately purged.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F14] font-mono text-[11px] text-[#CBD5E1]">
              Volatile RAM buffer lifetime: <span className="text-[#5B8FFF] font-bold">&lt; 3,000 ms</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center text-[#F59E0B] mb-4">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. DPDP Act 2023 Compliance</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Architected in strict accordance with India's Digital Personal Data Protection Act (DPDP Act 2023) and RBI Cyber Security Directives. Operates under explicit familial protective consent.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F14] font-mono text-[11px] text-[#CBD5E1]">
              Right to Erasure: <span className="text-[#F59E0B] font-bold">1-Click Local Data Purge</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center text-[#A78BFA] mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">4. Verbatim Quote Auditing</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              No alert can be triggered by LLM hallucinations or guesswork. The engine mandates that every flagged tactic corresponds to an exact substring in the caller's speech transcript.
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-[#0B0F14] font-mono text-[11px] text-[#CBD5E1]">
              Substrings verified: <span className="text-[#A78BFA] font-bold">100% Deterministic Regex</span>
            </div>
          </div>

        </div>

        {/* Data Lifecycle Flowchart */}
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B]">
          <h2 className="text-base font-bold text-white mb-4">Data Processing Lifecycle</h2>
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <strong className="text-white">Call Audio Ingestion:</strong>
                <p className="text-[#9CA3AF] mt-0.5">Streamed in ephemeral memory buffers on the protected elder's phone. Never recorded to MP3/WAV files on disk.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <strong className="text-white">Local STT & Regex Redaction:</strong>
                <p className="text-[#9CA3AF] mt-0.5">Transcribed utterances pass through the on-device PII stripper, replacing Aadhaar, bank numbers, and OTPs with generic tokens.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <strong className="text-white">Dual-Tier Threat Evaluation:</strong>
                <p className="text-[#9CA3AF] mt-0.5">Instant deterministic heuristics check for extortion language. An asynchronous request is dispatched to Gemini Flash for coercion reasoning without raw PII.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                4
              </div>
              <div>
                <strong className="text-white">Family Alert & Ephemeral Purge:</strong>
                <p className="text-[#9CA3AF] mt-0.5">If risk exceeds 65/100, the paired family member receives an emergency notification. Post-call, transcript data is stored solely in local storage for cybercrime complaint export and can be wiped anytime.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
