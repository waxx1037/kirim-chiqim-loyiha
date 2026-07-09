"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createExpense, updateExpense } from "@/actions/expense.actions";
import { formatDateInput } from "@/lib/formatters";

const schema = z.object({
  amount: z.coerce.number().positive("Summa 0 dan katta bo'lishi kerak"),
  categoryId: z.string().min(1, "Kategoriya tanlang"),
  date: z.string().min(1, "Sana kiriting"),
  description: z.string().optional(),
});

export default function ExpenseModal({ open, onOpenChange, expense, categories, onSuccess }) {
  const isEdit = !!expense;
  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: "",
      categoryId: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
  });

  useEffect(() => {
    if (expense) {
      reset({
        amount: expense.amount,
        categoryId: expense.categoryId,
        date: formatDateInput(expense.date),
        description: expense.description || "",
      });
    } else {
      reset({
        amount: "",
        categoryId: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
      });
    }
  }, [expense, reset]);

  const onSubmit = async (data) => {
    const result = isEdit
      ? await updateExpense(expense.id, data)
      : await createExpense(data);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Chiqim yangilandi!" : "Chiqim qo'shildi!");
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chiqimni Tahrirlash" : "Yangi Chiqim Qo'shish"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Summa (so'm)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="1,000,000"
              {...register("amount")}
              className={errors.amount ? "border-destructive" : ""}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Kategoriya</Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
            >
              <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                <SelectValue placeholder="Kategoriya tanlang..." />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Sana</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
              className={errors.date ? "border-destructive" : ""}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Izoh (ixtiyoriy)</Label>
            <Textarea
              id="description"
              placeholder="Chiqim haqida izoh..."
              {...register("description")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="expense">
              {isSubmitting ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
