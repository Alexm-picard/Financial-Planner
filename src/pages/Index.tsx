import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { 
  DollarSign, 
  TrendingDown, 
  PiggyBank, 
  CreditCard,
  ShoppingBag,
  Coffee,
  Home,
  Plane,
  Smartphone
} from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const transactions = [
    { name: "Grocery Shopping", category: "Food & Dining", amount: -156.42, date: "Today", icon: ShoppingBag, iconBg: "bg-orange-500/10" },
    { name: "Salary Deposit", category: "Income", amount: 4250.00, date: "Yesterday", icon: DollarSign, iconBg: "bg-success/10" },
    { name: "Coffee Shop", category: "Food & Dining", amount: -12.50, date: "Yesterday", icon: Coffee, iconBg: "bg-orange-500/10" },
    { name: "Rent Payment", category: "Housing", amount: -1850.00, date: "Dec 1", icon: Home, iconBg: "bg-blue-500/10" },
    { name: "Flight Booking", category: "Travel", amount: -432.00, date: "Nov 28", icon: Plane, iconBg: "bg-purple-500/10" },
    { name: "Phone Bill", category: "Utilities", amount: -89.99, date: "Nov 25", icon: Smartphone, iconBg: "bg-red-500/10" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Good evening, Alex</h2>
            <p className="text-muted-foreground">Here's your financial overview for December 2024</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Balance"
              value="$24,580.00"
              change="+12.5%"
              changeType="positive"
              icon={DollarSign}
              iconColor="text-primary"
            />
            <StatCard
              title="Monthly Spending"
              value="$3,240.00"
              change="-8.2%"
              changeType="positive"
              icon={TrendingDown}
              iconColor="text-destructive"
            />
            <StatCard
              title="Savings Goal"
              value="$18,450.00"
              change="73%"
              changeType="positive"
              icon={PiggyBank}
              iconColor="text-success"
            />
            <StatCard
              title="Credit Used"
              value="$2,890.00"
              change="+5.1%"
              changeType="negative"
              icon={CreditCard}
              iconColor="text-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Recent Transactions</h3>
                <button className="text-sm text-primary hover:text-primary/80 font-medium">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {transactions.map((transaction, index) => (
                  <TransactionItem key={index} {...transaction} />
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-xl font-bold mb-6">Budget Overview</h3>
              <div className="space-y-6">
                {[
                  { category: "Food & Dining", spent: 680, budget: 800, color: "bg-orange-500" },
                  { category: "Shopping", spent: 430, budget: 500, color: "bg-blue-500" },
                  { category: "Transportation", spent: 180, budget: 300, color: "bg-purple-500" },
                  { category: "Entertainment", spent: 240, budget: 250, color: "bg-pink-500" },
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${item.spent} / ${item.budget}
                      </span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.spent / item.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
