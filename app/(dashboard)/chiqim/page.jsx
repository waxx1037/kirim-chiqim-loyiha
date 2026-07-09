"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import ExpenseModal from "@/components/expenses/ExpenseModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import Pagination from "@/components/shared/Pagination";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";
import { getExpenses, deleteExpense } from "@/actions/expense.actions";
import { getExpenseCategories } from "@/actions/category.actions";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ChiqimPage() {
  const [expenses, setExpenses] = useState([]);
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
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [expensesRes, catsRes] = await Promise.all([
      getExpenses({ page, limit: 10, search, categoryId: categoryFilter, startDate, endDate }),
      getExpenseCategories(),
    ]);
    if (!expensesRes.error) {
      setExpenses(expensesRes.data);
      setTotal(expensesRes.total);
      setTotalPages(expensesRes.totalPages);
    }
    if (!catsRes.error) setCategories(catsRes.data);
    setLoading(false);
  }, [page, search, categoryFilter, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    const result = await deleteExpense(deleteId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Chiqim o'chirildi!");
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

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="animate-fade-in">
      <Header title="Chiqimlar" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-card-expense p-5 text-white shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <TrendingDown size={22} />
            </div>
            <div>
              <p className="text-sm text-white/80">Jami chiqimlar ({total} ta)</p>
              <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => { setEditExpense(null); setModalOpen(true); }}
            className="bg-white/20 text-white hover:bg-white/30 border-white/30"
          >
            <Plus size={16} /> Chiqim qo'shish
          </Button>
        </div>

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
              <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="w-40" />
              <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="w-40" />
              {(search || categoryFilter || startDate || endDate) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}><X size={14} /> Tozalash</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6"><TableSkeleton rows={5} cols={5} /></div>
            ) : expenses.length === 0 ? (
              <EmptyState title="Chiqimlar topilmadi" description="Yangi chiqim qo'shish uchun yuqoridagi tugmani bosing" />
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
                  {expenses.map((expense, i) => (
                    <TableRow key={expense.id}>
                      <TableCell className="text-muted-foreground">{(page - 1) * 10 + i + 1}</TableCell>
                      <TableCell><span className="font-bold text-expense">{formatCurrency(expense.amount)}</span></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: expense.category.color }} />
                          <span className="text-sm">{expense.category.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(expense.date)}</TableCell>
                      <TableCell className="text-muted-foreground max-w-48 truncate">{expense.description || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => { setEditExpense(expense); setModalOpen(true); }}>
                            <Pencil size={15} />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(expense.id)}>
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

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <ExpenseModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        expense={editExpense}
        categories={categories}
        onSuccess={fetchData}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Chiqimni o'chirish"
        description="Bu chiqimni o'chirishni tasdiqlaysizmi?"
      />
    </div>
  );
}
