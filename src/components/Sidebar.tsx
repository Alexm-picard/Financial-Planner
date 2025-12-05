import { Home, Wallet, CreditCard, Settings, History, PlusCircle, BarChart3, Calculator, Calendar, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "accounts", icon: Wallet, label: "Accounts" },
  { id: "transactions", icon: History, label: "Transactions" },
  { id: "add-transaction", icon: PlusCircle, label: "Add Transaction" },
  { id: "reports", icon: BarChart3, label: "Reports" },
  { id: "cost-calculator", icon: Calculator, label: "Cost Calculator" },
  { id: "calendar", icon: Calendar, label: "Calendar" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const navigate = useNavigate();

  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      // Logout function uses Auth0 for authentication
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
      navigate('/login');
    }
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Financial Planner
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manage your finances</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
