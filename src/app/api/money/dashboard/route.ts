import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  parseDateValue,
  toNumber,
} from "@/lib/money/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!userId) {
      return badRequest("userId is required.");
    }

    const dateFilter =
      fromDate || toDate
        ? {
            transactionDate: omitUndefined({
              gte: parseDateValue(fromDate),
              lte: parseDateValue(toDate),
            }),
          }
        : {};

    const [accountCount, categoryCount, transactionCount, totalBalance, incomeAgg, expenseAgg] =
      await Promise.all([
        prisma.financialAccount.count({ where: { userId, isArchived: false } }),
        prisma.category.count({ where: { userId, isActive: true } }),
        prisma.transaction.count({ where: { userId, ...dateFilter } }),
        prisma.financialAccount.aggregate({
          where: { userId, isArchived: false },
          _sum: { currentBalance: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, kind: "INCOME", status: "POSTED", ...dateFilter },
          _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
          where: { userId, kind: "EXPENSE", status: "POSTED", ...dateFilter },
          _sum: { amount: true },
        }),
      ]);

    return NextResponse.json({
      accountCount,
      categoryCount,
      transactionCount,
      totalBalance: toNumber(totalBalance._sum.currentBalance),
      totalIncome: toNumber(incomeAgg._sum.amount),
      totalExpense: toNumber(expenseAgg._sum.amount),
      netCashFlow: toNumber(incomeAgg._sum.amount) - toNumber(expenseAgg._sum.amount),
    });
  } catch (error) {
    return handleRouteError(error, "load dashboard summary");
  }
}
