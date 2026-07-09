import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 86399999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [
      todayIncome, todayExpense,
      monthIncome, monthExpense,
      totalTransactions,
      recentTransactions,
      dailyData,
      monthlyData,
      incomeByCat,
      expenseByCat,
    ] = await Promise.all([
      prisma.income.aggregate({ _sum: { amount: true }, where: { date: { gte: todayStart, lte: todayEnd } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: todayStart, lte: todayEnd } } }),
      prisma.income.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart, lte: monthEnd } } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: monthStart, lte: monthEnd } } }),
      prisma.$queryRaw`SELECT (SELECT COUNT(*) FROM incomes) + (SELECT COUNT(*) FROM expenses) as total`,
      prisma.$queryRaw`
        SELECT 'income' as type, amount, date, description, ic.name as category_name, ic.color as category_color
        FROM incomes i JOIN income_categories ic ON i.category_id = ic.id
        UNION ALL
        SELECT 'expense' as type, amount, date, description, ec.name as category_name, ec.color as category_color
        FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
        ORDER BY date DESC LIMIT 10
      `,
      prisma.$queryRaw`
        SELECT DATE(date) as day,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM (
          SELECT date, amount, 'income' as type FROM incomes WHERE date >= ${monthStart}
          UNION ALL
          SELECT date, amount, 'expense' as type FROM expenses WHERE date >= ${monthStart}
        ) t
        GROUP BY DATE(date) ORDER BY day
      `,
      prisma.$queryRaw`
        SELECT TO_CHAR(date, 'YYYY-MM') as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM (
          SELECT date, amount, 'income' as type FROM incomes
          WHERE date >= NOW() - INTERVAL '12 months'
          UNION ALL
          SELECT date, amount, 'expense' as type FROM expenses
          WHERE date >= NOW() - INTERVAL '12 months'
        ) t
        GROUP BY TO_CHAR(date, 'YYYY-MM') ORDER BY month
      `,
      prisma.$queryRaw`
        SELECT ic.name, ic.color, SUM(i.amount) as total
        FROM incomes i JOIN income_categories ic ON i.category_id = ic.id
        WHERE i.date >= ${monthStart}
        GROUP BY ic.name, ic.color
      `,
      prisma.$queryRaw`
        SELECT ec.name, ec.color, SUM(e.amount) as total
        FROM expenses e JOIN expense_categories ec ON e.category_id = ec.id
        WHERE e.date >= ${monthStart}
        GROUP BY ec.name, ec.color
      `,
    ]);

    const todayIncomeAmt = todayIncome._sum.amount || 0;
    const todayExpenseAmt = todayExpense._sum.amount || 0;
    const monthIncomeAmt = monthIncome._sum.amount || 0;
    const monthExpenseAmt = monthExpense._sum.amount || 0;

    return NextResponse.json({
      stats: {
        todayIncome: todayIncomeAmt,
        todayExpense: todayExpenseAmt,
        monthIncome: monthIncomeAmt,
        monthExpense: monthExpenseAmt,
        netProfit: monthIncomeAmt - monthExpenseAmt,
        totalTransactions: Number(totalTransactions[0]?.total || 0),
      },
      recentTransactions,
      dailyData,
      monthlyData,
      incomeByCat,
      expenseByCat,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
