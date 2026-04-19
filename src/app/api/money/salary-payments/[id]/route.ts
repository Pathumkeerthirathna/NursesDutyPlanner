import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, toNumber, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateSalaryPaymentInput } from "@/types/money";

function summarizeComponents(components?: UpdateSalaryPaymentInput["components"]) {
  const items = components ?? [];
  const gross = items
    .filter((item) => item.componentType !== "DEDUCTION" && item.componentType !== "TAX")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const deduction = items
    .filter((item) => item.componentType === "DEDUCTION" || item.componentType === "TAX")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  return { gross, deduction, net: gross - deduction };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const payment = await prisma.salaryPayment.findUnique({
      where: { id },
      include: {
        incomeSource: true,
        linkedTransaction: true,
        components: true,
      },
    });

    if (!payment) {
      return notFound("Salary payment");
    }

    return NextResponse.json(payment);
  } catch (error) {
    return handleRouteError(error, "load salary payment");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.salaryPayment.findUnique({ where: { id }, include: { components: true } });

    if (!current) {
      return notFound("Salary payment");
    }

    const body = (await req.json()) as UpdateSalaryPaymentInput;
    const computed = body.components ? summarizeComponents(body.components) : null;

    const payment = await prisma.salaryPayment.update({
      where: { id },
      data: {
        ...omitUndefined({
          salaryMonth: body.salaryMonth ? new Date(body.salaryMonth) : undefined,
          payDate: body.payDate ? new Date(body.payDate) : undefined,
          basicAmount: toOptionalNumber(body.basicAmount),
          grossAmount: toOptionalNumber(body.grossAmount) ?? computed?.gross,
          deductionAmount: toOptionalNumber(body.deductionAmount) ?? computed?.deduction,
          netAmount: toOptionalNumber(body.netAmount) ?? computed?.net,
          currencyCode: body.currencyCode,
          status: body.status,
          notes: body.notes,
        }),
        ...(body.incomeSourceId === null
          ? { incomeSource: { disconnect: true } }
          : body.incomeSourceId
            ? { incomeSource: { connect: { id: body.incomeSourceId } } }
            : {}),
        ...(body.linkedTransactionId === null
          ? { linkedTransaction: { disconnect: true } }
          : body.linkedTransactionId
            ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
            : {}),
        ...(body.components
          ? {
              components: {
                deleteMany: {},
                create: body.components.map((item) => ({
                  componentType: item.componentType,
                  componentName: item.componentName,
                  amount: item.amount,
                  isTaxable: item.isTaxable ?? false,
                  displayOrder: item.displayOrder ?? 0,
                  notes: item.notes ?? undefined,
                })),
              },
            }
          : {}),
      },
      include: {
        incomeSource: true,
        linkedTransaction: true,
        components: true,
      },
    });

    await writeAuditLog({
      userId: payment.userId,
      entityName: "SalaryPayment",
      entityId: payment.id,
      action: "UPDATE",
      description: "Updated salary payment record",
      beforeData: current,
      afterData: payment,
    });

    return NextResponse.json(payment);
  } catch (error) {
    return handleRouteError(error, "update salary payment");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.salaryPayment.findUnique({ where: { id } });

    if (!current) {
      return notFound("Salary payment");
    }

    const payment = await prisma.salaryPayment.update({
      where: { id },
      data: { status: "VOID" },
    });

    await writeAuditLog({
      userId: payment.userId,
      entityName: "SalaryPayment",
      entityId: payment.id,
      action: "ARCHIVE",
      description: "Voided salary payment record",
      beforeData: current,
      afterData: payment,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "void salary payment");
  }
}
