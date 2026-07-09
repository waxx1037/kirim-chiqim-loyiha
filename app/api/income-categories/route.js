import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.incomeCategory.findMany({
      include: { _count: { select: { incomes: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ data: categories });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const category = await prisma.incomeCategory.create({ data: body });
    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
