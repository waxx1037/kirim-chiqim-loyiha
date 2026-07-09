"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import IncomeModal from "@/components/incomes/IncomeModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";
import { getIncomes, deleteIncome } from "@/actions/income.actions";
import { getIncomeCategories } from "@/actions/category.actions";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function IncomiPage() {
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editIncome, setEditIncome] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [incomesRes, catsRes] = await Promise.all([
      getIncomes({ page, limit: 10, search, categoryId: categoryFilter, startDate, endDate }),
      getIncomeCategories(),
    ]);
    if (!incomesRes.error) {
      setIncomes(incomesRes.data);
      setTotal(incomesRes.total);
      setTotalPages(incomesRes.totalPages);
    }
    if (!catsRes.error) setCategories(catsRes.data);
    setLoading(false);
  }, [page, search, categoryFilter, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    const result = await deleteIncome(deleteId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Kirim o'chirildi!");
    setDeleteId(null);
    fetchData();
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const totalAmount = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="animate-fade-in">
      <Header title="Kirimlar" />
      <div className="p-6 space-y-6">

        {/* Summary */}
        <div className="flex items-center justify-between rounded-2xl bg-gradient-card-income p-5 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-sm text-white/80">Jami kirimlar ({total} ta)</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => { setEditIncome(null); setModalOpen(true); }}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            <Plus size={16} /> Kirim qo'shish
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-48">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-9"
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(v) => { setCategoryFilter(v === "all" ? "" : v); setPage(1); }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Kategoriya" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barcha kategoriyalar</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-40"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="w-40"
              />
              {(search || categoryFilter || startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X size={14} /> Tozalash
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
            ) : incomes.length === 0 ? (
              <EmptyState
                title="Kirimlar topilmadi"
                description="Yangi kirim qo'shish uchun yuqoridagi tugmani bosing"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Summa</TableHead>
                    <TableHead>Kategoriya</TableHead>
                    <TableHead>Sana</TableHead>
                    <TableHead>Izoh</TableHead>
                    <TableHead className="text-right">Amallar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomes.map((income, i) => (
                    <TableRow key={income.id}>
                      <TableCell className="text-muted-foreground">{(page - 1) * 10 + i + 1}</TableCell>
                      <TableCell>
                        <span className="font-bold text-income">{formatCurrency(income.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: income.category.color }}
                          />
                          <span className="text-sm">{income.category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(income.date)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">
                        {income.description || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { setEditIncome(income); setModalOpen(true); }}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(income.id)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      <IncomeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        income={editIncome}
        categories={categories}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kirimni o'chirish"
        description="Bu kirimni o'chirishni tasdiqlaysizmi? Bu amalni qaytarib bo'lmaydi."
      />
    </div>
  );
}
