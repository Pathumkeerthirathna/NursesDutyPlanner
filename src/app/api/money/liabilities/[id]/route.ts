import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, parseDateValue, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateLiabilityAccountInput, UpdateLiabilityInstallmentInput } from "@/types/money";

type UpdateLiabilityBody = UpdateLiabilityAccountInput & {
  installments?: UpdateLiabilityInstallmentInput[];
};

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const liability = await prisma.liabilityAccount.findUnique({
      where: { id },
      include: {
        installments: {
          include: {
            linkedTransaction: true,
          },
          orderBy: [{ installmentNo: "asc" }],
        },
      },
    });

    if (!liability) {
      return notFound("Liability account");
    }

    return NextResponse.json(liability);
  } catch (error) {
    return handleRouteError(error, "load liability account");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.liabilityAccount.findUnique({ where: { id }, include: { installments: true } });

    if (!current) {
      return notFound("Liability account");
    }

    const body = (await req.json()) as UpdateLiabilityBody;
    const validInstallments = (body.installments ?? []).filter(
      (
        item
      ): item is UpdateLiabilityInstallmentInput & {
        installmentNo: number;
        dueDate: string;
        totalDue: number;
      } =>
        item.installmentNo !== undefined &&
        item.dueDate !== undefined &&
        item.totalDue !== undefined
    );

    const liability = await prisma.liabilityAccount.update({
      where: { id },
      data: {
        ...omitUndefined({
          accountName: body.accountName,
          liabilityType: body.liabilityType,
          lenderName: body.lenderName,
          accountNumberMasked: body.accountNumberMasked,
          principalAmount: toOptionalNumber(body.principalAmount),
          outstandingAmount: toOptionalNumber(body.outstandingAmount),
          interestRate: toOptionalNumber(body.interestRate),
          emiAmount: toOptionalNumber(body.emiAmount),
          currencyCode: body.currencyCode,
          startDate: body.startDate ? new Date(body.startDate) : undefined,
          endDate: body.endDate ? new Date(body.endDate) : undefined,
          dueDay: body.dueDay,
          status: body.status,
          isActive: body.isActive,
          notes: body.notes,
        }),
        ...(body.installments
          ? {
              installments: {
                deleteMany: {},
                create: validInstallments.map((item) => ({
                  installmentNo: item.installmentNo,
                  dueDate: new Date(item.dueDate),
                  principalDue: toOptionalNumber(item.principalDue) ?? 0,
                  interestDue: toOptionalNumber(item.interestDue) ?? 0,
                  totalDue: toOptionalNumber(item.totalDue) ?? 0,
                  amountPaid: toOptionalNumber(item.amountPaid) ?? 0,
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
      userId: liability.userId,
      entityName: "LiabilityAccount",
      entityId: liability.id,
      action: "UPDATE",
      description: `Updated liability account ${liability.accountName}`,
      beforeData: current,
      afterData: liability,
    });

    return NextResponse.json(liability);
  } catch (error) {
    return handleRouteError(error, "update liability account");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.liabilityAccount.findUnique({ where: { id } });

    if (!current) {
      return notFound("Liability account");
    }

    const liability = await prisma.liabilityAccount.update({
      where: { id },
      data: {
        isActive: false,
        status: "CLOSED",
      },
    });

    await writeAuditLog({
      userId: liability.userId,
      entityName: "LiabilityAccount",
      entityId: liability.id,
      action: "ARCHIVE",
      description: `Closed liability account ${liability.accountName}`,
      beforeData: current,
      afterData: liability,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "close liability account");
  }
}
