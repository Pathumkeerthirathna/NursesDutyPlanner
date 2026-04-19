import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  toOptionalNumber,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateMonthlyFinancialSnapshotInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const snapshots = await prisma.monthlyFinancialSnapshot.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      orderBy: [{ snapshotMonth: "desc" }],
    });

    return NextResponse.json(snapshots);
  } catch (error) {
    return handleRouteError(error, "load monthly snapshots");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateMonthlyFinancialSnapshotInput;

    if (!body.userId || !body.snapshotMonth) {
      return badRequest("userId and snapshotMonth are required.");
    }

    const snapshot = await prisma.monthlyFinancialSnapshot.upsert({
      where: {
        userId_snapshotMonth: {
          userId: body.userId,
          snapshotMonth: new Date(body.snapshotMonth),
        },
      },
      update: {
        currencyCode: body.currencyCode ?? "LKR",
        totalIncome: toOptionalNumber(body.totalIncome) ?? 0,
        totalExpense: toOptionalNumber(body.totalExpense) ?? 0,
        totalSavings: toOptionalNumber(body.totalSavings) ?? 0,
        totalAssets: toOptionalNumber(body.totalAssets) ?? 0,
        totalLiabilities: toOptionalNumber(body.totalLiabilities) ?? 0,
        netWorth: toOptionalNumber(body.netWorth) ?? 0,
        reimbursementPending: toOptionalNumber(body.reimbursementPending) ?? 0,
        upcomingBills: toOptionalNumber(body.upcomingBills) ?? 0,
        healthScore: body.healthScore ?? undefined,
        status: body.status ?? "OPEN",
        notes: body.notes ?? undefined,
      },
      create: {
        user: { connect: { id: body.userId } },
        snapshotMonth: new Date(body.snapshotMonth),
        currencyCode: body.currencyCode ?? "LKR",
        totalIncome: toOptionalNumber(body.totalIncome) ?? 0,
        totalExpense: toOptionalNumber(body.totalExpense) ?? 0,
        totalSavings: toOptionalNumber(body.totalSavings) ?? 0,
        totalAssets: toOptionalNumber(body.totalAssets) ?? 0,
        totalLiabilities: toOptionalNumber(body.totalLiabilities) ?? 0,
        netWorth: toOptionalNumber(body.netWorth) ?? 0,
        reimbursementPending: toOptionalNumber(body.reimbursementPending) ?? 0,
        upcomingBills: toOptionalNumber(body.upcomingBills) ?? 0,
        healthScore: body.healthScore ?? undefined,
        status: body.status ?? "OPEN",
        notes: body.notes ?? undefined,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "MonthlyFinancialSnapshot",
      entityId: snapshot.id,
      action: "CREATE",
      description: "Created or updated monthly financial snapshot",
      afterData: snapshot,
    });

    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "save monthly snapshot");
  }
}
