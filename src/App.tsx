import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import AppLayout, { PageKey } from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import QRListPage from './pages/QRListPage';
import QRCreatePage from './pages/QRCreatePage';
import QRDetailPage from './pages/QRDetailPage';
import MultiLinkPage from './pages/MultiLinkPage';
import BusinessCardsPage from './pages/BusinessCardsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [params, setParams] = useState<Record<string, string>>({});

  const handleNavigate = (page: PageKey, p?: Record<string, string>) => {
    setCurrentPage(page);
    setParams(p ?? {});
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'qr-list':
        return <QRListPage onNavigate={handleNavigate} />;
      case 'qr-create':
        return <QRCreatePage onNavigate={handleNavigate} editId={params.id} />;
      case 'qr-detail':
        return <QRDetailPage qrId={params.id} onNavigate={handleNavigate} />;
      case 'multi-link':
        return <MultiLinkPage onNavigate={handleNavigate} />;
      case 'business-cards':
        return <BusinessCardsPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderPage()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
