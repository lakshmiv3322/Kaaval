import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { ElderScreen } from './pages/ElderScreen';
import { FamilyDashboard } from './pages/FamilyDashboard';
import { EvidencePackPage } from './pages/EvidencePackPage';
import { SplitDemoView } from './pages/SplitDemoView';
import { syncBus } from './services/syncChannel';

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
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
