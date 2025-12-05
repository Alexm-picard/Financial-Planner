import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import { Account } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { StatCard } from './StatCard';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface FinancialSummaryProps {
  accounts: Account[];
}

export const FinancialSummary = ({ accounts }: FinancialSummaryProps) => {
  const summary = useFinancialSummary(accounts);

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Financial Overview</h2>
        <p className="text-muted-foreground">
          Track your net worth, assets, and liabilities at a glance
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Worth"
          value={formatCurrency(summary.netWorth)}
          change={summary.netWorth >= 0 ? "" : ""}
          changeType={summary.netWorth >= 0 ? "positive" : "negative"}
          icon={DollarSign}
          iconColor={summary.netWorth >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard
          title="Total Assets"
          value={formatCurrency(summary.totalAssets)}
          change=""
          changeType="positive"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <StatCard
          title="Total Liabilities"
          value={formatCurrency(summary.totalLiabilities)}
          change=""
          changeType="negative"
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <StatCard
          title="Accounts"
          value={`${accounts.length} Total`}
          change=""
          changeType="positive"
          icon={Wallet}
          iconColor="text-primary"
        />
      </div>
    </div>
  );
};

