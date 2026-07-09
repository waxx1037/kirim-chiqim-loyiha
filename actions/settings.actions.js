"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const settingsSchema = z.object({
  companyName: z.string().min(1, "Korxona nomi kiriting"),
  currency: z.string().min(1, "Valyuta tanlang"),
});

export async function getSettings() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { companyName: "Mening Kompaniyam", currency: "UZS" },
      });
    }
    return { data: settings };
  } catch (error) {
    return { error: "Sozlamalarni olishda xato" };
  }
}

export async function updateSettings(id, formData) {
  try {
    const validated = settingsSchema.parse(formData);
    await prisma.settings.update({ where: { id }, data: validated });
    revalidatePath("/sozlamalar");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.errors[0].message };
    return { error: "Sozlamalarni yangilashda xato" };
  }
}
