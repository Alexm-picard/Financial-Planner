import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  icon: LucideIcon;
  iconColor?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon: Icon,
  iconColor = "text-primary"
}: StatCardProps) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover-lift">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg bg-secondary", iconColor)}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className={cn(
            "text-sm font-medium px-2 py-1 rounded-full",
            changeType === "positive" ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
          )}>
            {change}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};
