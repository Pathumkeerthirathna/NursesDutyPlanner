import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, parseDateValue, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateSavingsGoalInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const goal = await prisma.savingsGoal.findUnique({ where: { id } });

    if (!goal) {
      return notFound("Savings goal");
    }

    return NextResponse.json(goal);
  } catch (error) {
    return handleRouteError(error, "load savings goal");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.savingsGoal.findUnique({ where: { id } });

    if (!current) {
      return notFound("Savings goal");
    }

    const body = (await req.json()) as UpdateSavingsGoalInput;
    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: omitUndefined({
        goalName: body.goalName,
        targetAmount: toOptionalNumber(body.targetAmount),
        currentAmount: toOptionalNumber(body.currentAmount),
        currencyCode: body.currencyCode,
        targetDate: body.targetDate !== undefined ? parseDateValue(body.targetDate) : undefined,
        status: body.status,
        notes: body.notes,
        isActive: body.isActive,
      }),
    });

    await writeAuditLog({
      userId: goal.userId,
      entityName: "SavingsGoal",
      entityId: goal.id,
      action: "UPDATE",
      description: `Updated savings goal ${goal.goalName}`,
      beforeData: current,
      afterData: goal,
    });

    return NextResponse.json(goal);
  } catch (error) {
    return handleRouteError(error, "update savings goal");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.savingsGoal.findUnique({ where: { id } });

    if (!current) {
      return notFound("Savings goal");
    }

    const goal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        isActive: false,
        status: "CANCELLED",
      },
    });

    await writeAuditLog({
      userId: goal.userId,
      entityName: "SavingsGoal",
      entityId: goal.id,
      action: "ARCHIVE",
      description: `Archived savings goal ${goal.goalName}`,
      beforeData: current,
      afterData: goal,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "archive savings goal");
  }
}
