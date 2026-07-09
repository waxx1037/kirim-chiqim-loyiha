"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import EmptyState from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Archive } from "lucide-react";
import { getIncomes } from "@/actions/income.actions";
import { getExpenses } from "@/actions/expense.actions";
import { formatCurrency, formatDate, getMonthName } from "@/lib/formatters";

export default function ArxivPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = `${yearFilter}-01-01`;
    const endDate = `${yearFilter}-12-31`;

    const [incomesRes, expensesRes] = await Promise.all([
      getIncomes({ page: 1, limit: 10000, startDate, endDate }),
      getExpenses({ page: 1, limit: 10000, startDate, endDate }),
    ]);

    const allData = [
      ...(incomesRes.data || []).map((i) => ({ ...i, type: "income" })),
      ...(expensesRes.data || []).map((e) => ({ ...e, type: "expense" })),
    ];

    const grouped = allData.reduce((acc, item) => {
      const date = new Date(item.date);
      const month = date.getMonth();
      const key = `${yearFilter}-${String(month + 1).padStart(2, "0")}`;
      if (!acc[key]) {
        acc[key] = { key, month, year: yearFilter, items: [], income: 0, expense: 0 };
      }
      acc[key].items.push(item);
      if (item.type === "income") acc[key].income += item.amount;
      else acc[key].expense += item.amount;
      return acc;
    }, {});

    setData(Object.values(grouped).sort((a, b) => b.key.localeCompare(a.key)));
    setLoading(false);
  }, [yearFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredData = data.map((month) => ({
    ...month,
    items: month.items.filter((item) =>
      !search ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((month) => !search || month.items.length > 0);

  return (
    <div className="animate-fade-in">
      <Header title="Arxiv" />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 p-5 text-white shadow-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <Archive size={22} />
          </div>
          <div>
            <p className="text-sm text-white/80">Arxiv — Eski ma'lumotlar</p>
            <p className="text-lg font-bold">{yearFilter} yil hisobotlari</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>{y} yil</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <TableSkeleton rows={4} cols={4} />
        ) : filteredData.length === 0 ? (
          <EmptyState title="Ma'lumot topilmadi" description="Bu yil uchun arxiv ma'lumotlari yo'q" />
        ) : (
          <div className="space-y-4">
            {filteredData.map((month) => (
              <Card key={month.key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {getMonthName(month.month)} {month.year}
                    </CardTitle>
                    <div className="flex gap-3 text-sm">
                      <span className="text-income font-semibold">
                        + {formatCurrency(month.income)}
                      </span>
                      <span className="text-expense font-semibold">
                        - {formatCurrency(month.expense)}
                      </span>
                      <span className={`font-bold ${month.income - month.expense >= 0 ? "text-income" : "text-expense"}`}>
                        = {formatCurrency(month.income - month.expense)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {month.items.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-6 py-3 hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: item.category?.color + "30", color: item.category?.color }}
                          >
                            {item.type === "income"
                              ? <TrendingUp size={15} />
                              : <TrendingDown size={15} />
                            }
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.category?.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description || "Izoh yo'q"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${item.type === "income" ? "text-income" : "text-expense"}`}>
                            {item.type === "income" ? "+" : "-"}{formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    ))}
                    {month.items.length > 10 && (
                      <p className="px-6 py-2 text-center text-xs text-muted-foreground">
                        + {month.items.length - 10} ta ko'proq
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
