import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        startDate ? { date: { gte: new Date(startDate) } } : {},
        endDate ? { date: { lte: new Date(endDate + "T23:59:59") } } : {},
      ],
    };

    const [data, total] = await Promise.all([
      prisma.expense.findMany({
        where, include: { category: true },
        orderBy: { date: "desc" }, skip, take: limit,
      }),
      prisma.expense.count({ where }),
    ]);

    return NextResponse.json({ data, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
