import { Account } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Calendar, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onEdit?: (account: Account) => void;
  onClick?: (account: Account) => void;
  showActions?: boolean;
}

export const AccountCard = ({
  account,
  onEdit,
  onClick,
  showActions = true,
}: AccountCardProps) => {
  const isDebt = account.type === 'debt';
  const balance = Math.abs(account.balance);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(account);
  };

  return (
    <Card
      onClick={() => onClick?.(account)}
      className={cn(
        "h-full transition-all duration-200 cursor-pointer hover:shadow-lg hover:-translate-y-1",
        isDebt ? "border-l-4 border-l-destructive" : "border-l-4 border-l-success"
      )}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "p-3 rounded-xl flex items-center justify-center flex-shrink-0",
                isDebt
                  ? "bg-destructive/10 text-destructive"
                  : "bg-success/10 text-success"
              )}
            >
              {isDebt ? (
                <CreditCard className="h-5 w-5" />
              ) : (
                <Wallet className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 truncate">{account.name}</h3>
              <Badge
                variant="secondary"
                className={cn(
                  isDebt
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                    : "bg-success/10 text-success hover:bg-success/20"
                )}
              >
                {isDebt ? 'Debt' : 'Savings'}
              </Badge>
            </div>
          </div>
          {showActions && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="mb-4">
          <p
            className={cn(
              "text-3xl font-bold mb-2",
              isDebt ? "text-destructive" : "text-success"
            )}
          >
            {formatCurrency(balance)}
            {account.incomeSchedule && (
              <span className="text-lg font-normal text-muted-foreground ml-2">
                {account.incomeSchedule.frequency === 'weekly' ? 'Per Week' : account.incomeSchedule.frequency === 'bi-weekly' ? 'Bi-Weekly' : 'Per Month'}
              </span>
            )}
          </p>
          {account.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {account.description}
            </p>
          )}
        </div>

        {account.dueDate && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20 mb-3">
            <Calendar className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              Due: {new Date(account.dueDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        {account.incomeSchedule && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-1 font-medium">
              Pay Schedule
            </p>
            <p className="text-xs text-muted-foreground">
              Next payday: {new Date(account.incomeSchedule.payDayDate + 'T00:00:00').toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
        {account.monthlyPayment && account.monthlyPayment.amount > 0 && (
          <div className="pt-3 border-t">
            <p className="text-sm text-muted-foreground mb-1 font-medium">
              Monthly Payment
            </p>
            <p className="text-xl font-bold">
              {formatCurrency(account.monthlyPayment.amount)}
            </p>
            {account.monthlyPayment.nextPaymentDate && (
              <p className="text-xs text-muted-foreground mt-1">
                Next: {new Date(account.monthlyPayment.nextPaymentDate + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

