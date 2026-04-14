import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateBudgetInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!budget) {
      return notFound("Budget");
    }

    return NextResponse.json(budget);
  } catch (error) {
    return handleRouteError(error, "load budget");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateBudgetInput;

    const data: Record<string, unknown> = {
      ...omitUndefined({
        name: body.name,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        currencyCode: body.currencyCode,
        budgetAmount: body.budgetAmount,
        alertThresholdPercent: body.alertThresholdPercent,
        isActive: body.isActive,
      }),
    };

    if (body.categories) {
      data.categories = {
        deleteMany: {},
        create: body.categories.map((item) => ({
          category: { connect: { id: item.categoryId } },
          allocatedAmount: item.allocatedAmount,
          warningPercent: item.warningPercent,
        })),
      };
    }

    const budget = await prisma.budget.update({
      where: { id },
      data,
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(budget);
  } catch (error) {
    return handleRouteError(error, "update budget");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.budget.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete budget");
  }
}
