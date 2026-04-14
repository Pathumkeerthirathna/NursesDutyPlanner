import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateFinancialAccountInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const accounts = await prisma.financialAccount.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      orderBy: [{ isArchived: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return handleRouteError(error, "load financial accounts");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateFinancialAccountInput;

    if (!body.userId || !body.type || !body.name) {
      return badRequest("userId, type, and name are required.");
    }

    const account = await prisma.financialAccount.create({
      data: {
        user: { connect: { id: body.userId } },
        type: body.type,
        name: body.name,
        currencyCode: body.currencyCode ?? "LKR",
        institutionName: body.institutionName,
        accountNumberMasked: body.accountNumberMasked,
        openingBalance: body.openingBalance ?? 0,
        currentBalance: body.currentBalance ?? body.openingBalance ?? 0,
        creditLimit: body.creditLimit,
        statementDay: body.statementDay,
        paymentDueDay: body.paymentDueDay,
        isIncludedInNetWorth: body.isIncludedInNetWorth ?? true,
        isArchived: body.isArchived ?? false,
        openedDate: body.openedDate ? new Date(body.openedDate) : undefined,
        closedDate: body.closedDate ? new Date(body.closedDate) : undefined,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create financial account");
  }
}
