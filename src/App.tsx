import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { syncBus } from './services/syncChannel';

// Code-split route components with lazy loading
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const ElderScreen = lazy(() => import('./pages/ElderScreen').then(m => ({ default: m.ElderScreen })));
const FamilyDashboard = lazy(() => import('./pages/FamilyDashboard').then(m => ({ default: m.FamilyDashboard })));
const EvidencePackPage = lazy(() => import('./pages/EvidencePackPage').then(m => ({ default: m.EvidencePackPage })));
const SplitDemoView = lazy(() => import('./pages/SplitDemoView').then(m => ({ default: m.SplitDemoView })));
const EvalResultsPage = lazy(() => import('./pages/EvalResultsPage').then(m => ({ default: m.EvalResultsPage })));
const HowItDeploysPage = lazy(() => import('./pages/HowItDeploysPage').then(m => ({ default: m.HowItDeploysPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const JudgeBenchPage = lazy(() => import('./pages/JudgeBenchPage').then(m => ({ default: m.JudgeBenchPage })));

const RouteLoadingFallback: React.FC = () => (
  <div
    role="status"
    aria-live="polite"
    className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center"
  >
    <div className="relative w-12 h-12 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-[#1E293B] animate-ping opacity-30" />
      <div className="w-10 h-10 rounded-full border-2 border-t-[#5B8FFF] border-r-[#5B8FFF]/40 border-b-transparent border-l-transparent animate-spin" />
    </div>
    <p className="mt-4 text-xs font-mono text-[#9CA3AF] tracking-wider uppercase">Loading module...</p>
  </div>
);

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      return path && path !== '' ? path : '/';
    }
    return '/';
  });

  const [activeRiskScore, setActiveRiskScore] = useState<number>(0);
  const [hasActiveAlert, setHasActiveAlert] = useState<boolean>(false);

  // Sync route with browser history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', route);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Listen to global sync events to reflect threat state in Navbar
  useEffect(() => {
    const unsubscribe = syncBus.subscribe((msg) => {
      if (msg.type === 'CALL_UPDATE') {
        if (msg.payload.riskScore !== undefined) {
          setActiveRiskScore(msg.payload.riskScore);
        }
      } else if (msg.type === 'NEW_ALERT') {
        setHasActiveAlert(true);
        setActiveRiskScore(msg.payload.riskScore);
      } else if (msg.type === 'RESET_STATE') {
        setActiveRiskScore(0);
        setHasActiveAlert(false);
      }
    });
    return unsubscribe;
  }, []);

  // Determine which page to render
  const renderPage = () => {
    if (currentRoute === '/demo/elder') {
      return <ElderScreen onNavigate={navigate} />;
    }
    if (currentRoute === '/demo/family') {
      return <FamilyDashboard onNavigate={navigate} />;
    }
    if (currentRoute.startsWith('/demo/evidence')) {
      const parts = currentRoute.split('/');
      const callId = parts[3] || 'call-1049';
      return <EvidencePackPage callId={callId} onNavigate={navigate} />;
    }
    if (currentRoute === '/demo/split') {
      return <SplitDemoView onNavigate={navigate} />;
    }
    if (currentRoute === '/demo/eval') {
      return <EvalResultsPage onNavigate={navigate} />;
    }
    if (currentRoute === '/how-it-deploys') {
      return <HowItDeploysPage onNavigate={navigate} />;
    }
    if (currentRoute === '/privacy') {
      return <PrivacyPage onNavigate={navigate} />;
    }
    if (currentRoute === '/demo/judge') {
      return <JudgeBenchPage onNavigate={navigate} />;
    }
    return <LandingPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-[#E5E7EB] flex flex-col font-sans selection:bg-[#5B8FFF]/30 selection:text-white">
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigate}
        activeRiskScore={activeRiskScore}
        hasActiveAlert={hasActiveAlert}
      />
      <div className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentRoute}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<RouteLoadingFallback />}>
              {renderPage()}
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
