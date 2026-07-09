import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const category = await prisma.incomeCategory.update({ where: { id: params.id }, data: body });
    return NextResponse.json({ data: category });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await prisma.incomeCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Avval bu kategoriyaga bog'liq kirimlarni o'chiring" }, { status: 400 });
  }
}
