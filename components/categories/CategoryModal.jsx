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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  name: z.string().min(1, "Nomi kiriting"),
  color: z.string().min(1, "Rang tanlang"),
  icon: z.string().min(1, "Icon tanlang"),
});

const COLORS = [
  "#10B981", "#EF4444", "#3B82F6", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6B7280",
  "#14B8A6", "#A855F7", "#EAB308", "#22C55E", "#0EA5E9",
];

const ICONS = [
  "tag", "shopping-bag", "clipboard-list", "truck", "gift",
  "trending-up", "package", "users", "home", "zap", "flame",
  "droplets", "wifi", "landmark", "car", "megaphone", "wrench",
  "more-horizontal", "dollar-sign", "briefcase", "star", "heart",
];

export default function CategoryModal({ open, onOpenChange, category, onSave, type }) {
  const isEdit = !!category;
  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", color: "#10B981", icon: "tag" },
  });

  useEffect(() => {
    if (category) {
      reset({ name: category.name, color: category.color, icon: category.icon });
    } else {
      reset({ name: "", color: "#10B981", icon: "tag" });
    }
  }, [category, reset]);

  const onSubmit = async (data) => {
    const result = await onSave(data);
    if (result?.error) { toast.error(result.error); return; }
    toast.success(isEdit ? "Kategoriya yangilandi!" : "Kategoriya qo'shildi!");
    onOpenChange(false);
  };

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kategoriyani Tahrirlash" : `Yangi ${type === "income" ? "Kirim" : "Chiqim"} Kategoriyasi`}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Kategoriya nomi</Label>
            <Input
              id="name"
              placeholder="Kategoriya nomi..."
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Rang</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    ring: selectedColor === color ? `2px solid ${color}` : "none",
                    outline: selectedColor === color ? `2px solid ${color}` : "none",
                    outlineOffset: selectedColor === color ? "2px" : "0",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Icon</Label>
            <Select
              value={selectedIcon}
              onValueChange={(val) => setValue("icon", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Icon tanlang" />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => (
                  <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ backgroundColor: selectedColor }}
            >
              {watch("name")?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-sm font-medium">{watch("name") || "Kategoriya nomi"}</p>
              <p className="text-xs text-muted-foreground">{selectedIcon}</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Qo'shish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
