import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  title, value, subtitle, icon: Icon, gradient, trend, trendValue,
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-6 text-white shadow-xl transition-transform hover:-translate-y-1",
        gradient
      )}
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Icon size={22} />
            </div>
          )}
        </div>
        {trendValue !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend === "up" ? (
              <TrendingUp size={14} className="text-white" />
            ) : (
              <TrendingDown size={14} className="text-white/70" />
            )}
            <span className={trend === "up" ? "text-white" : "text-white/70"}>
              {trendValue}% o'tgan oyga nisbatan
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
