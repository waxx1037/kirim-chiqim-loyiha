const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Income categories
  const incomeCategories = [
    { name: "Savdo", color: "#10B981", icon: "shopping-bag" },
    { name: "Buyurtma", color: "#3B82F6", icon: "clipboard-list" },
    { name: "Yetkazib berish", color: "#F59E0B", icon: "truck" },
    { name: "Bonus", color: "#8B5CF6", icon: "gift" },
    { name: "Investitsiya", color: "#06B6D4", icon: "trending-up" },
    { name: "Boshqa", color: "#6B7280", icon: "more-horizontal" },
  ];

  for (const cat of incomeCategories) {
    await prisma.incomeCategory.upsert({
      where: { id: cat.name },
      update: {},
      create: cat,
    });
  }

  // Expense categories
  const expenseCategories = [
    { name: "Mahsulot xaridi", color: "#EF4444", icon: "package" },
    { name: "Ishchilar oyligi", color: "#F97316", icon: "users" },
    { name: "Ijara", color: "#EAB308", icon: "home" },
    { name: "Elektr", color: "#84CC16", icon: "zap" },
    { name: "Gaz", color: "#22C55E", icon: "flame" },
    { name: "Suv", color: "#06B6D4", icon: "droplets" },
    { name: "Internet", color: "#3B82F6", icon: "wifi" },
    { name: "Soliq", color: "#8B5CF6", icon: "landmark" },
    { name: "Transport", color: "#EC4899", icon: "car" },
    { name: "Reklama", color: "#F59E0B", icon: "megaphone" },
    { name: "Ta'mirlash", color: "#6B7280", icon: "wrench" },
    { name: "Boshqa", color: "#94A3B8", icon: "more-horizontal" },
  ];

  for (const cat of expenseCategories) {
    await prisma.expenseCategory.create({ data: cat });
  }

  // Settings
  await prisma.settings.create({
    data: {
      companyName: "Mening Kompaniyam",
      currency: "UZS",
      theme: "light",
    },
  });

  console.log("Seed muvaffaqiyatli bajarildi!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
