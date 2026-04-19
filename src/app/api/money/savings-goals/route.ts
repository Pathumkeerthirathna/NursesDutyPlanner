import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  parseDateValue,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateSavingsGoalInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as CreateSavingsGoalInput["status"] | null;

    const goals = await prisma.savingsGoal.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        status: status ?? undefined,
      }),
      orderBy: [{ targetDate: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(goals);
  } catch (error) {
    return handleRouteError(error, "load savings goals");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSavingsGoalInput;

    if (!body.userId || !body.goalName) {
      return badRequest("userId and goalName are required.");
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        user: { connect: { id: body.userId } },
        goalName: body.goalName,
        targetAmount: body.targetAmount,
        currentAmount: body.currentAmount ?? 0,
        currencyCode: body.currencyCode ?? "LKR",
        targetDate: parseDateValue(body.targetDate),
        status: body.status ?? "ACTIVE",
        notes: body.notes ?? undefined,
        isActive: body.isActive ?? true,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "SavingsGoal",
      entityId: goal.id,
      action: "CREATE",
      description: `Created savings goal ${goal.goalName}`,
      afterData: goal,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create savings goal");
  }
}
