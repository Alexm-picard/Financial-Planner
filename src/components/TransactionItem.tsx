import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionItemProps {
  name: string;
  category: string;
  amount: number;
  date: string;
  icon: LucideIcon;
  iconBg: string;
}

export const TransactionItem = ({ 
  name, 
  category, 
  amount, 
  date, 
  icon: Icon,
  iconBg
}: TransactionItemProps) => {
  const isPositive = amount > 0;
  
  return (
    <div className="flex items-center justify-between p-4 hover:bg-secondary/50 rounded-lg transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn("p-3 rounded-lg", iconBg)}>
          <Icon className="w-5 h-5 text-foreground" />
        </div>
        <div>
          <p className="font-medium">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{category}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
        </div>
      </div>
      <p className={cn(
        "font-semibold text-lg",
        isPositive ? "text-success" : "text-foreground"
      )}>
        {isPositive ? "+" : ""}{amount > 0 ? `$${amount}` : `-$${Math.abs(amount)}`}
      </p>
    </div>
  );
};
