import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined, toOptionalNumber, writeAuditLog } from "@/lib/money/api";

type CreateInvestmentBody = {
  userId: string;
  accountName: string;
  accountType: "STOCK" | "MUTUAL_FUND" | "ETF" | "BOND" | "RETIREMENT" | "FIXED_DEPOSIT" | "CRYPTO" | "OTHER";
  institutionName?: string | null;
  currencyCode?: string;
  costBasis?: number;
  currentValue?: number;
  unitsHeld?: number | null;
  isRetirement?: boolean;
  isArchived?: boolean;
  transactions?: Array<{
    transactionDate: string;
    transactionType: "BUY" | "SELL" | "DIVIDEND" | "INTEREST" | "FEE" | "ADJUSTMENT";
    quantity?: number | null;
    pricePerUnit?: number | null;
    totalAmount: number;
    fees?: number | null;
    notes?: string | null;
  }>;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const accounts = await prisma.investmentAccount.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      include: {
        transactions: {
          orderBy: [{ transactionDate: "desc" }],
        },
      },
      orderBy: [{ isArchived: "asc" }, { accountName: "asc" }],
    });

    return NextResponse.json(accounts);
  } catch (error) {
    return handleRouteError(error, "load investment accounts");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateInvestmentBody;

    if (!body.userId || !body.accountName || !body.accountType) {
      return badRequest("userId, accountName, and accountType are required.");
    }

    const account = await prisma.investmentAccount.create({
      data: {
        user: { connect: { id: body.userId } },
        accountName: body.accountName,
        accountType: body.accountType,
        institutionName: body.institutionName ?? undefined,
        currencyCode: body.currencyCode ?? "LKR",
        costBasis: body.costBasis ?? 0,
        currentValue: body.currentValue ?? 0,
        unitsHeld: toOptionalNumber(body.unitsHeld),
        isRetirement: body.isRetirement ?? false,
        isArchived: body.isArchived ?? false,
        ...(body.transactions?.length
          ? {
              transactions: {
                create: body.transactions.map((item) => ({
                  transactionDate: new Date(item.transactionDate),
                  transactionType: item.transactionType,
                  quantity: toOptionalNumber(item.quantity),
                  pricePerUnit: toOptionalNumber(item.pricePerUnit),
                  totalAmount: item.totalAmount,
                  fees: toOptionalNumber(item.fees),
                  notes: item.notes ?? undefined,
                })),
              },
            }
          : {}),
      },
      include: {
        transactions: true,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "InvestmentAccount",
      entityId: account.id,
      action: "CREATE",
      description: `Created investment account ${account.accountName}`,
      afterData: account,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create investment account");
  }
}
