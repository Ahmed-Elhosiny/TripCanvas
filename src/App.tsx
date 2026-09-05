import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider, TripProvider } from './store/store';
import { I18nProvider, useDocumentDirection } from './i18n/translations';
import { Toaster } from './components/ui';
import { LogoMark } from './components/icons';

const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Workspace = lazy(() => import('./pages/workspace/Workspace'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-chalk">
      <LogoMark size={44} className="animate-spin" style={{ animationDuration: '2.4s' }} />
      <p className="font-mono text-[11px] font-bold tracking-[0.28em] text-moss">CHARTING COURSE…</p>
    </div>
  );
}

function AppContent() {
  useDocumentDirection();
  
  return (
    <>
      <HashRouter>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/trips" element={<Dashboard />} />
            <Route path="/trip/:tripId" element={<Workspace />} />
            <Route path="/trip/:tripId/:tab" element={<Workspace />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/trips" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
      </HashRouter>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <TripProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </TripProvider>
    </I18nProvider>
  );
}
