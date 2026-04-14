import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateFinancialAccountInput } from "@/types/money";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const account = await prisma.financialAccount.findUnique({
      where: { id },
    });

    if (!account) {
      return notFound("Financial account");
    }

    return NextResponse.json(account);
  } catch (error) {
    return handleRouteError(error, "load financial account");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateFinancialAccountInput;

    const data = omitUndefined({
      type: body.type,
      name: body.name,
      currencyCode: body.currencyCode,
      institutionName: body.institutionName,
      accountNumberMasked: body.accountNumberMasked,
      openingBalance: body.openingBalance,
      currentBalance: body.currentBalance,
      creditLimit: body.creditLimit,
      statementDay: body.statementDay,
      paymentDueDay: body.paymentDueDay,
      isIncludedInNetWorth: body.isIncludedInNetWorth,
      isArchived: body.isArchived,
      openedDate: body.openedDate ? new Date(body.openedDate) : undefined,
      closedDate:
        body.closedDate === null
          ? null
          : body.closedDate
            ? new Date(body.closedDate)
            : undefined,
    });

    const account = await prisma.financialAccount.update({
      where: { id },
      data,
    });

    return NextResponse.json(account);
  } catch (error) {
    return handleRouteError(error, "update financial account");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.financialAccount.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete financial account");
  }
}
