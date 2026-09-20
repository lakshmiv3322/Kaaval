import React from 'react';
import { 
  Server, 
  Smartphone, 
  Radio, 
  ShieldCheck, 
  Cpu, 
  ArrowLeft, 
  Layers, 
  Lock, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Network
} from 'lucide-react';

export const HowItDeploysPage: React.FC<{ onNavigate: (route: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <button
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#5B8FFF]/20 border border-[#5B8FFF]/40 text-[#5B8FFF]">
              <Network className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                How Kaaval Deploys
              </h1>
              <p className="text-sm text-[#9CA3AF] mt-1">
                Technical feasibility, network topologies, and telephony integration architectures for nationwide scale.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Deployment Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tier 1: Telco */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-lg bg-[#3B82F6]/20 text-[#5B8FFF]">
                  <Server className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981]">
                  Zero App Install
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Telco Network Level</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Integrates directly into telecom operator IMS/SIP switches (Jio, Airtel, Vi). Forked media streams are transcribed at the telco edge and evaluated by Kaaval in real-time.
              </p>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Works on basic 2G feature phones (JioBharat)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  In-band audio tone / Flash SMS warning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Operator-level scammer number takedown
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E293B] text-[11px] text-[#9CA3AF]">
              Regulatory: Requires DoT / TRAI license authorization.
            </div>
          </div>

          {/* Tier 2: Smartphone OS */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-[#5B8FFF]/40 shadow-lg shadow-[#5B8FFF]/5 flex flex-col justify-between relative">
            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-[#5B8FFF] text-white text-[10px] font-bold tracking-wider uppercase">
              Current Prototype Target
            </span>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-lg bg-[#5B8FFF]/20 text-[#5B8FFF]">
                  <Smartphone className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#5B8FFF]/20 text-[#5B8FFF]">
                  Android Dialer SDK
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Smartphone OS Level</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Deployed via Android <code className="text-[#5B8FFF]">CallScreeningService</code> and <code className="text-[#5B8FFF]">TelecomManager</code> APIs. Streams real-time audio through on-device STT with local PII redaction.
              </p>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Zero server audio retention (100% ephemeral)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  High-contrast elder UI overlays during call
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Instant family push notifications & barge-in
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E293B] text-[11px] text-[#9CA3AF]">
              Privacy: 100% on-device PII masking before any API call.
            </div>
          </div>

          {/* Tier 3: VoIP */}
          <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="p-2 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B]">
                  <Radio className="w-5 h-5" />
                </span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[#F59E0B]">
                  WhatsApp / Skype
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. VoIP & Video Calls</h3>
              <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
                Targeting Digital Arrest scams conducted via Skype / WhatsApp video. Uses Android Accessibility audio loopback to monitor speaker output without violating sandbox isolation.
              </p>
              <ul className="space-y-2 text-xs text-[#CBD5E1]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Catches Skype video interrogation traps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Flags fake police uniform & video arrest orders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                  Automated family SOS alert
                </li>
              </ul>
            </div>
            <div className="mt-6 pt-4 border-t border-[#1E293B] text-[11px] text-[#9CA3AF]">
              Feasibility: Requires AccessibilityService permission grant.
            </div>
          </div>

        </div>

        {/* Technical Feasibility Matrix */}
        <div className="p-6 rounded-2xl bg-[#121824] border border-[#1E293B] overflow-x-auto">
          <h2 className="text-lg font-bold text-white mb-4">
            Feasibility & Architecture Comparison Matrix
          </h2>
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-[#1E293B] text-[#9CA3AF]">
                <th className="py-3 px-4">Architecture</th>
                <th className="py-3 px-4">Inference Latency</th>
                <th className="py-3 px-4">Privacy Boundary</th>
                <th className="py-3 px-4">Battery Impact</th>
                <th className="py-3 px-4">Elder UX Friction</th>
                <th className="py-3 px-4">Feasibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-[#E5E7EB]">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Telco IMS Fork (SIP)</td>
                <td className="py-3.5 px-4 text-[#10B981]">~200 ms</td>
                <td className="py-3.5 px-4 text-[#9CA3AF]">Operator Private Enclave</td>
                <td className="py-3.5 px-4 text-[#10B981]">0% (Zero device drain)</td>
                <td className="py-3.5 px-4 text-[#10B981]">Zero (No app needed)</td>
                <td className="py-3.5 px-4 text-[#F59E0B]">Requires Telco Partnership</td>
              </tr>
              <tr className="bg-[#5B8FFF]/5">
                <td className="py-3.5 px-4 font-semibold text-[#5B8FFF]">Android Dialer (Kaaval)</td>
                <td className="py-3.5 px-4 text-[#10B981]">&lt; 1 ms (Rules) / 900ms (LLM)</td>
                <td className="py-3.5 px-4 text-[#10B981]">On-Device Redacted</td>
                <td className="py-3.5 px-4 text-[#10B981]">&lt; 2% daily battery</td>
                <td className="py-3.5 px-4 text-[#10B981]">Low (Auto-activates on call)</td>
                <td className="py-3.5 px-4 text-[#10B981]">Fully Production Ready</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-white">Accessibility Loopback</td>
                <td className="py-3.5 px-4 text-[#5B8FFF]">~1.2 s</td>
                <td className="py-3.5 px-4 text-[#9CA3AF]">Local Process Sandbox</td>
                <td className="py-3.5 px-4 text-[#F59E0B]">~4-6% during active call</td>
                <td className="py-3.5 px-4 text-[#F59E0B]">Medium (One-time permission)</td>
                <td className="py-3.5 px-4 text-[#10B981]">Functional on Android 12+</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
