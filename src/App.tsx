import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { Items } from './pages/Items';
import { Patients } from './pages/Patients';
import { Invoices } from './pages/Invoices';
import { Inventory } from './pages/Inventory';
import { Settings } from './pages/Settings';

type ViewType = 'dashboard' | 'billing' | 'items' | 'patients' | 'invoices' | 'inventory' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    const handleNavigate = (event: Event) => {
      const customEvent = event as CustomEvent<ViewType>;
      setCurrentView(customEvent.detail);
      window.location.hash = customEvent.detail;
    };

    window.addEventListener('navigate', handleNavigate);

    const hash = window.location.hash.slice(1) as ViewType;
    if (hash && ['dashboard', 'billing', 'items', 'patients', 'invoices', 'inventory', 'settings'].includes(hash)) {
      setCurrentView(hash);
    }

    return () => {
      window.removeEventListener('navigate', handleNavigate);
    };
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'billing':
        return <Billing />;
      case 'items':
        return <Items />;
      case 'patients':
        return <Patients />;
      case 'invoices':
        return <Invoices />;
      case 'inventory':
        return <Inventory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

export default App;
