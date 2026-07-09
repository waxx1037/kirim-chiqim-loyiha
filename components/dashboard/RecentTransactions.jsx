import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function RecentTransactions({ data = [] }) {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Oxirgi Tranzaksiyalar</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Tranzaksiyalar mavjud emas</p>
        ) : (
          <div className="space-y-3">
            {data.map((t, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-background p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: t.category_color + "20", color: t.category_color }}
                  >
                    {t.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.category_name}</p>
                    <p className="text-xs text-muted-foreground">{t.description || "Izoh yo'q"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                    {t.type === "income" ? "+" : "-"}{formatCurrency(Number(t.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(t.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
