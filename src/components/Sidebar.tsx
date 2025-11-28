import { Home, TrendingUp, Wallet, CreditCard, Settings, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "analytics", icon: TrendingUp, label: "Analytics" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "cards", icon: CreditCard, label: "Cards" },
  { id: "budget", icon: PieChart, label: "Budget" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          FinFlow
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Your Money, Your Rhythm</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
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
        <div className="bg-secondary rounded-lg p-4">
          <p className="text-sm font-medium mb-1">Upgrade to Pro</p>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock advanced features
          </p>
          <button className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      </div>
    </aside>
  );
};
