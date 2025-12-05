import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Callback from "./pages/Callback";
import Accounts from "./pages/Accounts";
import TransactionHistory from "./pages/TransactionHistory";
import AddTransaction from "./pages/AddTransaction";
import Reports from "./pages/Reports";
import CostCalculator from "./pages/CostCalculator";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Check if Auth0 is properly configured
const isAuth0Configured = () => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  return domain && clientId && 
         domain !== 'your-tenant.auth0.com' && 
         clientId !== 'your_client_id_here' &&
         !domain.includes('placeholder');
};

// Auth0 Setup Required Component
const Auth0SetupRequired = () => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Auth0 Configuration Required</CardTitle>
        <CardDescription>
          Please configure Auth0 to use the application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Setup Required</AlertTitle>
          <AlertDescription>
            Auth0 environment variables are not configured. Please set up Auth0 to continue.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <h3 className="font-semibold">Quick Setup Steps:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Create Auth0 account at <a href="https://auth0.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">auth0.com</a></li>
            <li>Create a Single Page Application in Auth0 Dashboard</li>
            <li>Copy Domain and Client ID from Application Settings</li>
            <li>Update your <code className="bg-muted px-1 rounded">.env</code> file with real values:
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">
{`VITE_AUTH0_DOMAIN=your-actual-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_actual_client_id`}
              </pre>
            </li>
            <li>Configure Callback URLs in Auth0: <code className="bg-muted px-1 rounded">http://localhost:8080/login,https://financial-planner-final-final.web.app/login</code></li>
            <li>Restart the dev server</li>
          </ol>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">For detailed instructions, see:</p>
          <ul className="text-sm space-y-1">
            <li>• <code className="bg-muted px-1 rounded">AUTH0_QUICK_START.md</code> - 10-minute setup guide</li>
            <li>• <code className="bg-muted px-1 rounded">FIX_UNDEFINED_ERROR.md</code> - Troubleshooting guide</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
);

const App = () => {
  // Check if Auth0 is configured
  if (!isAuth0Configured()) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Auth0SetupRequired />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/callback"
              element={<Callback />}
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/accounts" element={<Accounts />} />
                      <Route path="/transactions" element={<TransactionHistory />} />
                      <Route path="/add-transaction" element={<AddTransaction />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/cost-calculator" element={<CostCalculator />} />
                      <Route path="/calendar" element={<Calendar />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
