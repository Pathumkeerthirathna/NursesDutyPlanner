import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, toOptionalNumber, writeAuditLog } from "@/lib/money/api";

type UpdateInvestmentBody = {
  accountName?: string;
  accountType?: "STOCK" | "MUTUAL_FUND" | "ETF" | "BOND" | "RETIREMENT" | "FIXED_DEPOSIT" | "CRYPTO" | "OTHER";
  institutionName?: string | null;
  currencyCode?: string;
  costBasis?: number;
  currentValue?: number;
  unitsHeld?: number | null;
  isRetirement?: boolean;
  isArchived?: boolean;
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const account = await prisma.investmentAccount.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: [{ transactionDate: "desc" }],
        },
      },
    });

    if (!account) {
      return notFound("Investment account");
    }

    return NextResponse.json(account);
  } catch (error) {
    return handleRouteError(error, "load investment account");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.investmentAccount.findUnique({ where: { id } });

    if (!current) {
      return notFound("Investment account");
    }

    const body = (await req.json()) as UpdateInvestmentBody;
    const account = await prisma.investmentAccount.update({
      where: { id },
      data: omitUndefined({
        accountName: body.accountName,
        accountType: body.accountType,
        institutionName: body.institutionName,
        currencyCode: body.currencyCode,
        costBasis: toOptionalNumber(body.costBasis),
        currentValue: toOptionalNumber(body.currentValue),
        unitsHeld: toOptionalNumber(body.unitsHeld),
        isRetirement: body.isRetirement,
        isArchived: body.isArchived,
      }),
    });

    await writeAuditLog({
      userId: account.userId,
      entityName: "InvestmentAccount",
      entityId: account.id,
      action: "UPDATE",
      description: `Updated investment account ${account.accountName}`,
      beforeData: current,
      afterData: account,
    });

    return NextResponse.json(account);
  } catch (error) {
    return handleRouteError(error, "update investment account");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.investmentAccount.findUnique({ where: { id } });

    if (!current) {
      return notFound("Investment account");
    }

    const account = await prisma.investmentAccount.update({
      where: { id },
      data: { isArchived: true },
    });

    await writeAuditLog({
      userId: account.userId,
      entityName: "InvestmentAccount",
      entityId: account.id,
      action: "ARCHIVE",
      description: `Archived investment account ${account.accountName}`,
      beforeData: current,
      afterData: account,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "archive investment account");
  }
}
