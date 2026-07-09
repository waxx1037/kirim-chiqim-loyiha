"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Nomi kiriting"),
  color: z.string().min(1, "Rang tanlang"),
  icon: z.string().min(1, "Icon tanlang"),
});

export async function getIncomeCategories() {
  try {
    const categories = await prisma.incomeCategory.findMany({
      include: { _count: { select: { incomes: true } } },
      orderBy: { createdAt: "asc" },
    });
    return { data: categories };
  } catch (error) {
    return { error: "Kategoriyalarni olishda xato" };
  }
}

export async function getExpenseCategories() {
  try {
    const categories = await prisma.expenseCategory.findMany({
      include: { _count: { select: { expenses: true } } },
      orderBy: { createdAt: "asc" },
    });
    return { data: categories };
  } catch (error) {
    return { error: "Kategoriyalarni olishda xato" };
  }
}

export async function createIncomeCategory(formData) {
  try {
    const validated = categorySchema.parse(formData);
    await prisma.incomeCategory.create({ data: validated });
    revalidatePath("/kirim-kategoriyalar");
    revalidatePath("/kirim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.errors[0].message };
    return { error: "Kategoriya qo'shishda xato" };
  }
}

export async function updateIncomeCategory(id, formData) {
  try {
    const validated = categorySchema.parse(formData);
    await prisma.incomeCategory.update({ where: { id }, data: validated });
    revalidatePath("/kirim-kategoriyalar");
    revalidatePath("/kirim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.errors[0].message };
    return { error: "Kategoriyani yangilashda xato" };
  }
}

export async function deleteIncomeCategory(id) {
  try {
    await prisma.incomeCategory.delete({ where: { id } });
    revalidatePath("/kirim-kategoriyalar");
    return { success: true };
  } catch (error) {
    return { error: "Kategoriyani o'chirishda xato. Avval kirimlarni o'chiring." };
  }
}

export async function createExpenseCategory(formData) {
  try {
    const validated = categorySchema.parse(formData);
    await prisma.expenseCategory.create({ data: validated });
    revalidatePath("/chiqim-kategoriyalar");
    revalidatePath("/chiqim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.errors[0].message };
    return { error: "Kategoriya qo'shishda xato" };
  }
}

export async function updateExpenseCategory(id, formData) {
  try {
    const validated = categorySchema.parse(formData);
    await prisma.expenseCategory.update({ where: { id }, data: validated });
    revalidatePath("/chiqim-kategoriyalar");
    revalidatePath("/chiqim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.errors[0].message };
    return { error: "Kategoriyani yangilashda xato" };
  }
}

export async function deleteExpenseCategory(id) {
  try {
    await prisma.expenseCategory.delete({ where: { id } });
    revalidatePath("/chiqim-kategoriyalar");
    return { success: true };
  } catch (error) {
    return { error: "Kategoriyani o'chirishda xato. Avval chiqimlarni o'chiring." };
  }
}
