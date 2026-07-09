"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const incomeSchema = z.object({
  amount: z.coerce.number().positive("Summa musbat bo'lishi kerak"),
  categoryId: z.string().min(1, "Kategoriya tanlang"),
  date: z.string().min(1, "Sana kiriting"),
  description: z.string().optional(),
});

export async function getIncomes({ page = 1, limit = 10, search = "", categoryId = "", startDate = "", endDate = "" } = {}) {
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

    const [incomes, total] = await Promise.all([
      prisma.income.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.income.count({ where }),
    ]);

    return { data: incomes, total, totalPages: Math.ceil(total / limit) };
  } catch (error) {
    return { error: "Ma'lumotlarni olishda xato yuz berdi" };
  }
}

export async function createIncome(formData) {
  try {
    const validated = incomeSchema.parse({
      amount: formData.amount,
      categoryId: formData.categoryId,
      date: formData.date,
      description: formData.description,
    });

    await prisma.income.create({
      data: {
        amount: validated.amount,
        categoryId: validated.categoryId,
        date: new Date(validated.date),
        description: validated.description || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/kirim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Kirim qo'shishda xato yuz berdi" };
  }
}

export async function updateIncome(id, formData) {
  try {
    const validated = incomeSchema.parse({
      amount: formData.amount,
      categoryId: formData.categoryId,
      date: formData.date,
      description: formData.description,
    });

    await prisma.income.update({
      where: { id },
      data: {
        amount: validated.amount,
        categoryId: validated.categoryId,
        date: new Date(validated.date),
        description: validated.description || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/kirim");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }
    return { error: "Kirimni yangilashda xato yuz berdi" };
  }
}

export async function deleteIncome(id) {
  try {
    await prisma.income.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/kirim");
    return { success: true };
  } catch (error) {
    return { error: "Kirimni o'chirishda xato yuz berdi" };
  }
}

export async function getDashboardStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86399999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [todayIncome, monthIncome, totalIncomeCount] = await Promise.all([
      prisma.income.aggregate({
        _sum: { amount: true },
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.income.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.income.count(),
    ]);

    return {
      todayIncome: todayIncome._sum.amount || 0,
      monthIncome: monthIncome._sum.amount || 0,
      totalIncomeCount,
    };
  } catch (error) {
    return { error: "Statistikani olishda xato" };
  }
}
