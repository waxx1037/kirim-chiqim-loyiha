import { Suspense } from "react";
import Header from "@/components/layout/Header";
import StatCard from "@/components/shared/StatCard";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import DailyChart from "@/components/dashboard/charts/DailyChart";
import MonthlyChart from "@/components/dashboard/charts/MonthlyChart";
import CategoryPie from "@/components/dashboard/charts/CategoryPie";
import { CardSkeleton, ChartSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatCurrency } from "@/lib/formatters";
import {
  TrendingUp, TrendingDown, DollarSign, Activity,
  Wallet, PiggyBank,
} from "lucide-react";

async function getDashboardData() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/dashboard`, { cache: "no-store" });
    if (!res.ok) throw new Error("API error");
    return res.json();
  } catch {
    return {
      stats: { todayIncome: 0, todayExpense: 0, monthIncome: 0, monthExpense: 0, netProfit: 0, totalTransactions: 0 },
      recentTransactions: [],
      dailyData: [],
      monthlyData: [],
      incomeByCat: [],
      expenseByCat: [],
    };
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { stats, recentTransactions, dailyData, monthlyData, incomeByCat, expenseByCat } = data;

  const statCards = [
    {
      title: "Bugungi Kirim",
      value: formatCurrency(stats.todayIncome),
      icon: TrendingUp,
      gradient: "bg-gradient-card-income",
    },
    {
      title: "Bugungi Chiqim",
      value: formatCurrency(stats.todayExpense),
      icon: TrendingDown,
      gradient: "bg-gradient-card-expense",
    },
    {
      title: "Oylik Kirim",
      value: formatCurrency(stats.monthIncome),
      icon: Wallet,
      gradient: "bg-gradient-card-profit",
    },
    {
      title: "Oylik Chiqim",
      value: formatCurrency(stats.monthExpense),
      icon: DollarSign,
      gradient: "bg-gradient-card-total",
    },
    {
      title: "Sof Foyda",
      value: formatCurrency(stats.netProfit),
      icon: PiggyBank,
      gradient: stats.netProfit >= 0 ? "bg-gradient-card-income" : "bg-gradient-card-expense",
    },
    {
      title: "Jami Tranzaksiyalar",
      value: stats.totalTransactions.toString(),
      icon: Activity,
      gradient: "bg-gradient-to-135 from-slate-600 to-slate-800",
    },
  ];

  return (
    <div className="animate-fade-in">
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          {statCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <DailyChart data={dailyData} />
          <CategoryPie data={incomeByCat} title="Kirim kategoriyalar" />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <MonthlyChart data={monthlyData} />
          <CategoryPie data={expenseByCat} title="Chiqim kategoriyalar" />
        </div>

        {/* Recent transactions */}
        <RecentTransactions data={recentTransactions} />
      </div>
    </div>
  );
}
