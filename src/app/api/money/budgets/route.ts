import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateBudgetInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const budgets = await prisma.budget.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ startDate: "desc" }],
    });

    return NextResponse.json(budgets);
  } catch (error) {
    return handleRouteError(error, "load budgets");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBudgetInput;

    if (!body.userId || !body.name || !body.startDate || !body.endDate) {
      return badRequest("userId, name, startDate, and endDate are required.");
    }

    const budget = await prisma.budget.create({
      data: {
        user: { connect: { id: body.userId } },
        name: body.name,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        currencyCode: body.currencyCode ?? "LKR",
        budgetAmount: body.budgetAmount,
        alertThresholdPercent: body.alertThresholdPercent,
        isActive: body.isActive ?? true,
        ...(body.categories?.length
          ? {
              categories: {
                create: body.categories.map((item) => ({
                  category: { connect: { id: item.categoryId } },
                  allocatedAmount: item.allocatedAmount,
                  warningPercent: item.warningPercent,
                })),
              },
            }
          : {}),
      },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create budget");
  }
}
