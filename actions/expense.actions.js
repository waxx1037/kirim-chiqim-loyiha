"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const expenseSchema = z.object({
  amount: z.coerce.number().positive("Summa musbat bo'lishi kerak"),
  categoryId: z.string().min(1, "Kategoriya tanlang"),
  date: z.string().min(1, "Sana kiriting"),
  description: z.string().optional(),
});

export async function getExpenses({ page = 1, limit = 10, search = "", categoryId = "", startDate = "", endDate = "" } = {}) {
  try {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        search ? {
          OR: [
            { description: { contains: search, mode: "insensitive" } },
            { category: { name: { contains: search, mode: "insensitive" } } },
          ],
        } : {},
        categoryId ? { categoryId } : {},
        startDate ? { date: { gte: new Date(startDate) } } : {},
        endDate ? { date: { lte: new Date(endDate + "T23:59:59") } } : {},
      ],
    };

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return { data: expenses, total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    return { error: "Ma'lumotlarni olishda xato yuz berdi" };
  }
}

export async function createExpense(formData) {
  try {
    const validated = expenseSchema.parse({
      amount: formData.amount,
      categoryId: formData.categoryId,
      date: formData.date,
      description: formData.description,
    });

    await prisma.expense.create({
      data: {
        amount: validated.amount,
        categoryId: validated.categoryId,
        date: new Date(validated.date),
        description: validated.description || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/chiqim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Chiqim qo'shishda xato yuz berdi" };
  }
}

export async function updateExpense(id, formData) {
  try {
    const validated = expenseSchema.parse({
      amount: formData.amount,
      categoryId: formData.categoryId,
      date: formData.date,
      description: formData.description,
    });

    await prisma.expense.update({
      where: { id },
      data: {
        amount: validated.amount,
        categoryId: validated.categoryId,
        date: new Date(validated.date),
        description: validated.description || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/chiqim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Chiqimni yangilashda xato yuz berdi" };
  }
}

export async function deleteExpense(id) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/chiqim");
    return { success: true };
  } catch (error) {
    return { error: "Chiqimni o'chirishda xato yuz berdi" };
  }
}
