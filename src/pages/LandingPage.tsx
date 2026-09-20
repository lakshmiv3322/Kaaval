import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { BentoGridSection } from '../components/landing/BentoGridSection';
import { HeroSection } from '../components/landing/HeroSection';
import { NinetySecondsSection } from '../components/landing/NinetySecondsSection';
import { PROOF_STATS } from '../data/proof';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

const anatomyPhrases = [
  { phrase: 'Inspector Rathore from Crime Branch Mumbai.', label: 'Authority claim', explanation: 'Real police never investigate or demand payment through an unsolicited call.', risk: 25 },
  { phrase: 'An arrest warrant is issued in your name under Section 420.', label: 'Arrest threat', explanation: 'A frightening legal claim is used to make the victim act before they can verify it.', risk: 30 },
  { phrase: 'Do not speak to your family. Transfer funds now.', label: 'Secrecy demand', explanation: 'Isolation blocks the one simple defence: asking someone you trust to check the story.', risk: 37 },
];

const AudienceCard: React.FC<{ id: string; title: string; copy: string }> = ({ id, title, copy }) => (
  <div id={id} className="editorial-card flex min-h-52 flex-col justify-between p-7 sm:p-9">
    <ShieldCheck className="h-6 w-6 text-[var(--color-accent)]" />
    <div>
      <h3 className="text-2xl font-semibold text-white">{title}</h3>
      <p className="mt-3 max-w-lg text-[17px] leading-7 text-[var(--color-text-secondary)]">{copy}</p>
    </div>
  </div>
);

const ProofSection: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [revealed, setRevealed] = useState<number[]>([]);

  useEffect(() => {
    const element = document.querySelector('[data-proof-section]');
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(PROOF_STATS.map((_, index) => index));
        observer.disconnect();
      }
    }, { threshold: 0.35 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section data-proof-section className="page-section bg-[var(--color-surface)]/45" id="proof">
      <div className="page-shell">
        <div className="section-kicker">Proof, with the asterisk included</div>
        <div className="mt-5 grid gap-8 border-y border-[var(--color-border)] py-8 md:grid-cols-3 md:gap-0">
          {PROOF_STATS.map((stat, index) => (
            <div key={stat.label} className="border-[var(--color-border)] md:border-l md:px-8 first:md:border-l-0 first:md:pl-0">
              <div className="font-mono text-4xl font-medium tracking-tight text-white sm:text-5xl">{reduceMotion || revealed.includes(index) ? stat.value : '—'}</div>
              <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--color-text-secondary)]">{stat.label}</p>
              <p className="mt-3 text-xs leading-5 text-[var(--color-text-muted)]">Source: {stat.source}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          <AudienceCard id="for-families" title="For families" copy="A calm, one-tap way to be present when an elder is being pressured, without listening to every ordinary call." />
          <AudienceCard id="for-banks" title="For banks & telcos" copy="A clearer handoff from a coercive call to a verified incident, with the context needed for faster intervention." />
        </div>
      </div>
    </section>
  );
};

const AnatomyButton: React.FC<{ index: number; open: number[]; setOpen: React.Dispatch<React.SetStateAction<number[]>> }> = ({ index, open, setOpen }) => {
  const item = anatomyPhrases[index];
  const isOpen = open.includes(index);
  return (
    <span className="relative inline">
      <button type="button" onClick={() => setOpen((current) => isOpen ? current.filter((value) => value !== index) : [...current, index])} className="touch-target border-b border-dashed border-[var(--color-accent)] text-left text-[var(--color-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]">{item.phrase}</button>
      {isOpen && <span role="status" className="mt-3 block max-w-sm rounded-lg border border-[var(--color-accent)]/35 bg-[var(--color-base)] p-3 text-sm leading-6 text-[var(--color-text-secondary)] sm:absolute sm:left-0 sm:z-10 sm:w-72"><strong className="text-white">{item.label}:</strong> {item.explanation}</span>}
    </span>
  );
};

const ScamAnatomySection: React.FC = () => {
  const [open, setOpen] = useState<number[]>([]);
  const risk = open.reduce((sum, index) => sum + anatomyPhrases[index].risk, 0);
  return (
    <section id="scam-anatomy" className="page-section">
      <div className="page-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <div className="section-kicker">Scam anatomy</div>
          <h2 className="editorial-heading mt-5">The script is designed to make <em>thinking feel dangerous.</em></h2>
          <p className="editorial-copy mt-6">Tap the underlined phrases to see the tactic hiding in plain sight.</p>
        </div>
        <div className="editorial-card p-7 sm:p-10">
          <div className="space-y-5 text-xl leading-9 text-white sm:text-2xl sm:leading-10">
            <p>"This is <AnatomyButton index={0} open={open} setOpen={setOpen} />"</p>
            <p>"<AnatomyButton index={1} open={open} setOpen={setOpen} />"</p>
            <p>"<AnatomyButton index={2} open={open} setOpen={setOpen} />"</p>
          </div>
          <div className="mt-10 border-t border-[var(--color-border)] pt-5">
            <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)]"><span>Revealed risk</span><span className="font-mono text-white">{Math.min(risk, 92)} / 100</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-base)]"><motion.div animate={{ width: `${Math.min(risk, 92)}%` }} className="h-full rounded-full bg-[var(--color-risk-high)]" transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} /></div>
            <p className="mt-3 text-sm text-[var(--color-text-muted)]">Every highlighted phrase is a reason to pause and verify.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => (
  <main className="overflow-hidden">
    <HeroSection onNavigate={onNavigate} />
    <NinetySecondsSection />
    <BentoGridSection />
    <ScamAnatomySection />
    <ProofSection />
    <section className="relative overflow-hidden border-t border-[var(--color-border)] py-28 sm:py-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(91,143,255,0.18),transparent_55%)]" />
      <div className="page-shell relative text-center">
        <div className="section-kicker">For the people who picked up</div>
        <h2 className="editorial-heading mx-auto mt-5 max-w-3xl">Protect the people who <em>picked up the phone for you.</em></h2>
        <button type="button" onClick={() => onNavigate('/demo/elder')} className="primary-button mt-9"><span>Watch the live demo</span><ArrowUpRight className="h-4 w-4" /></button>
      </div>
    </section>
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 py-8">
      <div className="page-shell flex flex-col gap-6 text-sm text-[var(--color-text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <span className="text-white">Kaaval — keep the conversation open.</span>
        <nav className="flex flex-wrap gap-x-5 gap-y-2"><a href="#how-it-works">How it works</a><a href="#for-families">For families</a><a href="#for-banks">For banks</a><a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"><ExternalLink className="mr-1 inline h-3.5 w-3.5" />Report fraud</a></nav>
        <span className="max-w-sm leading-5">Prototype built for a hackathon. Not a substitute for reporting fraud at cybercrime.gov.in / 1930.</span>
      </div>
    </footer>
  </main>
);
