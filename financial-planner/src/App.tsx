import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase-config';
import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import TransactionHistory from './pages/TransactionHistory';
import AddTransaction from './pages/AddTransaction';
import CostCalculator from './pages/CostCalculator';
import Reports from './pages/Reports';
import Accounts from './pages/Accounts';
import Calendar from './pages/Calendar';

const App: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#F5F7FA'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/*"
        element={
          user ? (
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/add-transaction" element={<AddTransaction />} />
                <Route path="/cost-calculator" element={<CostCalculator />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </DashboardLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

export default App;
