"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import CategoryModal from "@/components/categories/CategoryModal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  getExpenseCategories,
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} from "@/actions/category.actions";

export default function ChiqimKategoriyalarPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await getExpenseCategories();
    if (!res.error) setCategories(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async (data) => {
    const result = editCat
      ? await updateExpenseCategory(editCat.id, data)
      : await createExpenseCategory(data);
    if (!result.error) fetchData();
    return result;
  };

  const handleDelete = async () => {
    const result = await deleteExpenseCategory(deleteId);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Kategoriya o'chirildi!");
    setDeleteId(null);
    fetchData();
  };

  return (
    <div className="animate-fade-in">
      <Header title="Chiqim Kategoriyalar" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Chiqim Kategoriyalari</h2>
            <p className="text-sm text-muted-foreground">{categories.length} ta kategoriya</p>
          </div>
          <Button onClick={() => { setEditCat(null); setModalOpen(true); }}>
            <Plus size={16} /> Kategoriya qo'shish
          </Button>
        </div>

        {loading ? (
          <CardSkeleton count={8} />
        ) : categories.length === 0 ? (
          <EmptyState title="Kategoriyalar topilmadi" description="Yangi kategoriya qo'shing" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-lg font-bold shadow-md"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{cat.name}</p>
                        <Badge variant="expense" className="mt-0.5 text-[10px]">
                          {cat._count?.expenses || 0} ta chiqim
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditCat(cat); setModalOpen(true); }}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteId(cat.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editCat}
        onSave={handleSave}
        type="expense"
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kategoriyani o'chirish"
        description="Bu kategoriyani o'chirishdan oldin unga bog'liq barcha chiqimlarni o'chiring."
      />
    </div>
  );
}
