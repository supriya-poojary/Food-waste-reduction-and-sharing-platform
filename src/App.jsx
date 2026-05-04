import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { initializeData } from './data/storage';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import SmartMatchesPage from './pages/SmartMatchesPage';
import FoodDetailPage from './pages/FoodDetailPage';
import DonatePage from './pages/DonatePage';
import RequestPage from './pages/RequestPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import PaymentPage from './pages/PaymentPage';

// Import storage to ensure any initial setup logic runs (if any)
import './data/storage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Pages that should NOT show the footer (full-screen forms)
const NO_FOOTER_PATHS = ['/auth', '/matches'];

function Layout() {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/matches" element={<SmartMatchesPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen pt-24 flex items-center justify-center text-center px-4">
                <div className="animate-fade-up">
                  <div className="text-8xl mb-6">🍃</div>
                  <h1 className="font-display font-black text-5xl text-white mb-4">404</h1>
                  <p className="text-white/60 text-lg mb-8">Oops! This page doesn't exist.</p>
                  <a href="/" className="btn-primary px-8 py-3 inline-flex items-center gap-2 rounded-xl font-bold">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
      {showFooter && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <ScrollToTop />
          <Layout />
          <Toaster
            position="top-right"
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(15,23,42,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                fontSize: '14px',
                fontFamily: "'Inter', sans-serif",
                padding: '12px 16px',
                maxWidth: '360px',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#fff' },
                style: {
                  borderLeft: '3px solid #22c55e',
                },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' },
                style: {
                  borderLeft: '3px solid #ef4444',
                },
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
