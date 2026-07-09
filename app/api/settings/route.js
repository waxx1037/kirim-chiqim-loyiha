import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({
        data: { companyName: "Mening Kompaniyam", currency: "UZS" },
      });
    }
    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({ where: { id: settings.id }, data: body });
    } else {
      settings = await prisma.settings.create({ data: body });
    }
    return NextResponse.json({ data: settings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
