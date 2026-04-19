import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  parseDateValue,
  toOptionalNumber,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateLiabilityAccountInput, CreateLiabilityInstallmentInput } from "@/types/money";

type CreateLiabilityBody = CreateLiabilityAccountInput & {
  installments?: CreateLiabilityInstallmentInput[];
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as CreateLiabilityAccountInput["status"] | null;

    const liabilities = await prisma.liabilityAccount.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        status: status ?? undefined,
      }),
      include: {
        installments: {
          orderBy: [{ installmentNo: "asc" }],
        },
      },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(liabilities);
  } catch (error) {
    return handleRouteError(error, "load liabilities");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateLiabilityBody;

    if (!body.userId || !body.accountName || !body.liabilityType) {
      return badRequest("userId, accountName, and liabilityType are required.");
    }

    const liability = await prisma.liabilityAccount.create({
      data: {
        user: { connect: { id: body.userId } },
        accountName: body.accountName,
        liabilityType: body.liabilityType,
        lenderName: body.lenderName ?? undefined,
        accountNumberMasked: body.accountNumberMasked ?? undefined,
        principalAmount: body.principalAmount,
        outstandingAmount: body.outstandingAmount,
        interestRate: toOptionalNumber(body.interestRate),
        emiAmount: toOptionalNumber(body.emiAmount),
        currencyCode: body.currencyCode ?? "LKR",
        startDate: parseDateValue(body.startDate),
        endDate: parseDateValue(body.endDate),
        dueDay: body.dueDay ?? undefined,
        status: body.status ?? "ACTIVE",
        isActive: body.isActive ?? true,
        notes: body.notes ?? undefined,
        ...(body.installments?.length
          ? {
              installments: {
                create: body.installments.map((item) => ({
                  installmentNo: item.installmentNo,
                  dueDate: new Date(item.dueDate),
                  principalDue: item.principalDue ?? 0,
                  interestDue: item.interestDue ?? 0,
                  totalDue: item.totalDue,
                  amountPaid: item.amountPaid ?? 0,
                  paidDate: parseDateValue(item.paidDate),
                  status: item.status ?? "PENDING",
                  notes: item.notes ?? undefined,
                  ...(item.linkedTransactionId
                    ? { linkedTransaction: { connect: { id: item.linkedTransactionId } } }
                    : {}),
                })),
              },
            }
          : {}),
      },
      include: {
        installments: true,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "LiabilityAccount",
      entityId: liability.id,
      action: "CREATE",
      description: `Created liability account ${liability.accountName}`,
      afterData: liability,
    });

    return NextResponse.json(liability, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create liability account");
  }
}
