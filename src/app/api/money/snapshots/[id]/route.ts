import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateMonthlyFinancialSnapshotInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const snapshot = await prisma.monthlyFinancialSnapshot.findUnique({ where: { id } });

    if (!snapshot) {
      return notFound("Monthly financial snapshot");
    }

    return NextResponse.json(snapshot);
  } catch (error) {
    return handleRouteError(error, "load monthly snapshot");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.monthlyFinancialSnapshot.findUnique({ where: { id } });

    if (!current) {
      return notFound("Monthly financial snapshot");
    }

    const body = (await req.json()) as UpdateMonthlyFinancialSnapshotInput;
    const snapshot = await prisma.monthlyFinancialSnapshot.update({
      where: { id },
      data: omitUndefined({
        snapshotMonth: body.snapshotMonth ? new Date(body.snapshotMonth) : undefined,
        currencyCode: body.currencyCode,
        totalIncome: toOptionalNumber(body.totalIncome),
        totalExpense: toOptionalNumber(body.totalExpense),
        totalSavings: toOptionalNumber(body.totalSavings),
        totalAssets: toOptionalNumber(body.totalAssets),
        totalLiabilities: toOptionalNumber(body.totalLiabilities),
        netWorth: toOptionalNumber(body.netWorth),
        reimbursementPending: toOptionalNumber(body.reimbursementPending),
        upcomingBills: toOptionalNumber(body.upcomingBills),
        healthScore: body.healthScore,
        status: body.status,
        notes: body.notes,
      }),
    });

    await writeAuditLog({
      userId: snapshot.userId,
      entityName: "MonthlyFinancialSnapshot",
      entityId: snapshot.id,
      action: "UPDATE",
      description: "Updated monthly financial snapshot",
      beforeData: current,
      afterData: snapshot,
    });

    return NextResponse.json(snapshot);
  } catch (error) {
    return handleRouteError(error, "update monthly snapshot");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.monthlyFinancialSnapshot.findUnique({ where: { id } });

    if (!current) {
      return notFound("Monthly financial snapshot");
    }

    const snapshot = await prisma.monthlyFinancialSnapshot.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });

    await writeAuditLog({
      userId: snapshot.userId,
      entityName: "MonthlyFinancialSnapshot",
      entityId: snapshot.id,
      action: "ARCHIVE",
      description: "Archived monthly financial snapshot",
      beforeData: current,
      afterData: snapshot,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "archive monthly snapshot");
  }
}
