"use client";
import { useState, useCallback } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/shared/StatCard";
import DailyChart from "@/components/dashboard/charts/DailyChart";
import { ChartSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  TrendingUp, TrendingDown, PiggyBank, Download, Printer,
  FileSpreadsheet, FileText, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { getDateRange, formatCurrency, formatDate } from "@/lib/formatters";
import { getIncomes } from "@/actions/income.actions";
import { getExpenses } from "@/actions/expense.actions";

const PERIODS = [
  { label: "Bugun", value: "today" },
  { label: "Kecha", value: "yesterday" },
  { label: "Shu hafta", value: "week" },
  { label: "Shu oy", value: "month" },
  { label: "O'tgan oy", value: "lastMonth" },
  { label: "Shu yil", value: "year" },
  { label: "Sana oralig'i", value: "custom" },
];

export default function HisobotlarPage() {
  const [period, setPeriod] = useState("month");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const generateReport = useCallback(async () => {
    setLoading(true);
    let startDate, endDate;

    if (period === "custom") {
      if (!customStart || !customEnd) {
        toast.error("Sana oralig'ini kiriting");
        setLoading(false);
        return;
      }
      startDate = customStart;
      endDate = customEnd;
    } else {
      const range = getDateRange(period);
      startDate = range.from.toISOString().split("T")[0];
      endDate = range.to.toISOString().split("T")[0];
    }

    const [incomesRes, expensesRes] = await Promise.all([
      getIncomes({ page: 1, limit: 1000, startDate, endDate }),
      getExpenses({ page: 1, limit: 1000, startDate, endDate }),
    ]);

    const totalIncome = incomesRes.data?.reduce((sum, i) => sum + i.amount, 0) || 0;
    const totalExpense = expensesRes.data?.reduce((sum, e) => sum + e.amount, 0) || 0;

    setReportData({
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomes: incomesRes.data || [],
      expenses: expensesRes.data || [],
      startDate,
      endDate,
    });
    setLoading(false);
  }, [period, customStart, customEnd]);

  const exportExcel = async () => {
    if (!reportData) return;
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    const incomeRows = reportData.incomes.map((i) => ({
      Sana: formatDate(i.date),
      Kategoriya: i.category?.name || "",
      Summa: i.amount,
      Izoh: i.description || "",
    }));
    const expenseRows = reportData.expenses.map((e) => ({
      Sana: formatDate(e.date),
      Kategoriya: e.category?.name || "",
      Summa: e.amount,
      Izoh: e.description || "",
    }));

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(incomeRows), "Kirimlar");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), "Chiqimlar");
    XLSX.writeFile(wb, `hisobot_${reportData.startDate}_${reportData.endDate}.xlsx`);
    toast.success("Excel fayl yuklab olindi!");
  };

  const exportPDF = async () => {
    if (!reportData) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Moliyaviy Hisobot", 14, 20);
    doc.setFontSize(10);
    doc.text(`Sana: ${reportData.startDate} - ${reportData.endDate}`, 14, 30);
    doc.text(`Jami kirim: ${formatCurrency(reportData.totalIncome)}`, 14, 38);
    doc.text(`Jami chiqim: ${formatCurrency(reportData.totalExpense)}`, 14, 46);
    doc.text(`Sof foyda: ${formatCurrency(reportData.netProfit)}`, 14, 54);

    if (reportData.incomes.length > 0) {
      doc.setFontSize(12);
      doc.text("Kirimlar", 14, 66);
      autoTable(doc, {
        startY: 70,
        head: [["Sana", "Kategoriya", "Summa", "Izoh"]],
        body: reportData.incomes.map((i) => [
          formatDate(i.date), i.category?.name, formatCurrency(i.amount), i.description || "",
        ]),
        headStyles: { fillColor: [16, 185, 129] },
      });
    }

    doc.save(`hisobot_${reportData.startDate}.pdf`);
    toast.success("PDF fayl yuklab olindi!");
  };

  const printReport = () => {
    window.print();
  };

  const dailyChartData = reportData
    ? Object.values(
        [...reportData.incomes, ...reportData.expenses].reduce((acc, t) => {
          const day = t.date.toString().split("T")[0];
          if (!acc[day]) acc[day] = { day, income: 0, expense: 0 };
          if (reportData.incomes.includes(t)) acc[day].income += t.amount;
          else acc[day].expense += t.amount;
          return acc;
        }, {})
      ).sort((a, b) => a.day.localeCompare(b.day))
    : [];

  return (
    <div className="animate-fade-in">
      <Header title="Hisobotlar" />
      <div className="p-6 space-y-6">
        {/* Period Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={18} />
              Davr tanlash
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  variant={period === p.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            {period === "custom" && (
              <div className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1">
                  <Label>Boshlanish sanasi</Label>
                  <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-40" />
                </div>
                <div className="space-y-1">
                  <Label>Tugash sanasi</Label>
                  <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-40" />
                </div>
              </div>
            )}

            <Button onClick={generateReport} disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Hisobot yaratish"}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {reportData && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                title="Jami Kirim"
                value={formatCurrency(reportData.totalIncome)}
                icon={TrendingUp}
                gradient="bg-gradient-card-income"
              />
              <StatCard
                title="Jami Chiqim"
                value={formatCurrency(reportData.totalExpense)}
                icon={TrendingDown}
                gradient="bg-gradient-card-expense"
              />
              <StatCard
                title="Sof Foyda"
                value={formatCurrency(reportData.netProfit)}
                icon={PiggyBank}
                gradient={reportData.netProfit >= 0 ? "bg-gradient-card-income" : "bg-gradient-card-expense"}
              />
            </div>

            {dailyChartData.length > 0 && <DailyChart data={dailyChartData} />}

            {/* Export buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Eksport</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={exportExcel}>
                    <FileSpreadsheet size={16} className="text-green-600" />
                    Excel yuklab olish
                  </Button>
                  <Button variant="outline" onClick={exportPDF}>
                    <FileText size={16} className="text-red-600" />
                    PDF yuklab olish
                  </Button>
                  <Button variant="outline" onClick={printReport}>
                    <Printer size={16} />
                    Chop etish
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
