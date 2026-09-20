import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, Phone, CheckCircle, ShieldCheck, X } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string, role: string) => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Son');
  const [otp, setOtp] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || (!email && !phone)) return;
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('success');
    setTimeout(() => {
      onSuccess(name, relation);
      setStep('input');
      setName('');
      setEmail('');
      setPhone('');
      onClose();
    }, 1400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[#121821] border border-[#1E293B] rounded-2xl p-6 shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-[#9CA3AF] hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#5B8FFF]/20 border border-[#5B8FFF]/40 flex items-center justify-center text-[#5B8FFF]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Add Family Guardian</h3>
              <p className="text-xs text-[#9CA3AF]">Receive instant alerts & one-tap call barge-in</p>
            </div>
          </div>

          {step === 'input' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-1.5 uppercase">Guardian Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Ramaswamy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#5B8FFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-1.5 uppercase">Relationship</label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#5B8FFF]"
                >
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Caregiver">Primary Caregiver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-1.5 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="guardian@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#5B8FFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#9CA3AF] mb-1.5 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white text-sm focus:outline-none focus:border-[#5B8FFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white font-semibold text-sm transition-all shadow-md shadow-[#5B8FFF]/25 mt-2"
              >
                Send Verification OTP
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-[#9CA3AF]">
                A 4-digit verification code was sent to <span className="text-white font-medium">{email || phone}</span>. (Enter demo code <span className="text-[#5B8FFF] font-mono">1 2 3 4</span>)
              </p>

              <div className="flex justify-center gap-3 my-4">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otp[idx]}
                    onChange={(e) => {
                      const val = e.target.value;
                      const next = [...otp];
                      next[idx] = val;
                      setOtp(next);
                      if (val && e.target.nextElementSibling) {
                        (e.target.nextElementSibling as HTMLInputElement).focus();
                      }
                    }}
                    className="w-12 h-12 text-center text-xl font-mono font-bold rounded-xl bg-[#0B0F14] border border-[#1E293B] text-white focus:border-[#5B8FFF] focus:outline-none"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#5B8FFF] hover:bg-[#4A7CEB] text-white font-semibold text-sm transition-all"
              >
                Verify & Authorize Guardian
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-14 h-14 text-emerald-400 mb-3 animate-bounce" />
              <h4 className="text-lg font-bold text-white">Guardian Verified!</h4>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {name} ({relation}) is now authorized to receive live digital arrest alerts and barge in.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
