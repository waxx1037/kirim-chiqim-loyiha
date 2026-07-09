import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const income = await prisma.income.findUnique({
      where: { id: params.id }, include: { category: true },
    });
    if (!income) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    return NextResponse.json({ data: income });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.income.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
