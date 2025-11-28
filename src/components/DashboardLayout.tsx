import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    // Map routes to tab IDs
    const routeMap: Record<string, string> = {
      '/': 'home',
      '/accounts': 'accounts',
      '/transactions': 'transactions',
      '/add-transaction': 'add-transaction',
      '/reports': 'reports',
      '/cost-calculator': 'cost-calculator',
      '/calendar': 'calendar',
      '/settings': 'settings',
    };
    
    const currentTab = routeMap[location.pathname] || 'home';
    setActiveTab(currentTab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const routeMap: Record<string, string> = {
      'home': '/',
      'accounts': '/accounts',
      'transactions': '/transactions',
      'add-transaction': '/add-transaction',
      'reports': '/reports',
      'cost-calculator': '/cost-calculator',
      'calendar': '/calendar',
      'settings': '/settings',
    };
    
    const route = routeMap[tab];
    if (route) {
      navigate(route);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

