"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMonthName } from "@/lib/formatters";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-xl">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-sm font-medium" style={{ color: entry.fill }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function MonthlyChart({ data = [] }) {
  const chartData = data.map((d) => ({
    month: getMonthName(new Date(d.month + "-01").getMonth()),
    Kirim: Number(d.income),
    Chiqim: Number(d.expense),
    Foyda: Number(d.income) - Number(d.expense),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Oylik Tahlil</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Kirim" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Chiqim" fill="#EF4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Foyda" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
