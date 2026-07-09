"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Globe, Moon, Sun, Download, Upload, Save, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { getSettings, updateSettings } from "@/actions/settings.actions";

const CURRENCIES = [
  { value: "UZS", label: "UZS — O'zbek so'mi" },
  { value: "USD", label: "USD — AQSh dollari" },
  { value: "EUR", label: "EUR — Yevro" },
  { value: "RUB", label: "RUB — Rossiya rubli" },
];

export default function SozlamalarPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [currency, setCurrency] = useState("UZS");

  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getSettings();
      if (!res.error) {
        setSettings(res.data);
        setCompanyName(res.data.companyName);
        setCurrency(res.data.currency);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateSettings(settings.id, { companyName, currency });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Sozlamalar saqlandi!");
    }
    setSaving(false);
  };

  const handleBackup = async () => {
    try {
      const [incomesRes, expensesRes] = await Promise.all([
        fetch("/api/incomes").then((r) => r.json()),
        fetch("/api/expenses").then((r) => r.json()),
      ]);

      const backup = {
        exportedAt: new Date().toISOString(),
        settings: { companyName, currency },
        incomes: incomesRes.data || [],
        expenses: expensesRes.data || [],
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup yuklab olindi!");
    } catch {
      toast.error("Backup yaratishda xato");
    }
  };

  const handleRestore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        toast.success(`Backup o'qildi: ${data.exportedAt}`);
      } catch {
        toast.error("Noto'g'ri fayl formati");
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <div>
        <Header title="Sozlamalar" />
        <div className="p-6">
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Header title="Sozlamalar" />
      <div className="p-6 space-y-6 max-w-2xl">
        {/* Company settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 size={18} />
              Korxona Ma'lumotlari
            </CardTitle>
            <CardDescription>Korxona nomi va asosiy sozlamalar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Korxona nomi</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Korxona nomi..."
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-2">
                <Globe size={14} />
                Valyuta
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              <Save size={16} />
              {saving ? "Saqlanmoqda..." : "Sozlamalarni saqlash"}
            </Button>
          </CardContent>
        </Card>

        {/* Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
              Ko'rinish Rejimi
            </CardTitle>
            <CardDescription>Dark yoki Light rejimni tanlang</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun size={18} className="text-muted-foreground" />
                <span className="text-sm font-medium">Dark rejim</span>
                <Moon size={18} className="text-muted-foreground" />
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw size={18} />
              Backup va Tiklash
            </CardTitle>
            <CardDescription>Ma'lumotlarni saqlash va tiklash</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium">Ma'lumotlarni saqlash</p>
                <p className="text-sm text-muted-foreground">Barcha ma'lumotlarni JSON formatda yuklab oling</p>
              </div>
              <Button variant="outline" onClick={handleBackup}>
                <Download size={16} />
                Backup
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div>
                <p className="font-medium">Ma'lumotlarni tiklash</p>
                <p className="text-sm text-muted-foreground">JSON backup fayldan ma'lumotlarni tiklang</p>
              </div>
              <label>
                <Button variant="outline" asChild>
                  <span>
                    <Upload size={16} />
                    Restore
                  </span>
                </Button>
                <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
