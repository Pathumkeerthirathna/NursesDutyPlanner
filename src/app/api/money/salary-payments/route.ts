import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  toNumber,
  toOptionalNumber,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateSalaryPaymentInput } from "@/types/money";

function summarizeComponents(components?: CreateSalaryPaymentInput["components"]) {
  const items = components ?? [];
  const gross = items
    .filter((item) => item.componentType !== "DEDUCTION" && item.componentType !== "TAX")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);
  const deduction = items
    .filter((item) => item.componentType === "DEDUCTION" || item.componentType === "TAX")
    .reduce((sum, item) => sum + toNumber(item.amount), 0);

  return {
    gross,
    deduction,
    net: gross - deduction,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const incomeSourceId = searchParams.get("incomeSourceId");

    const payments = await prisma.salaryPayment.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        incomeSourceId: incomeSourceId ?? undefined,
      }),
      include: {
        incomeSource: true,
        linkedTransaction: true,
        components: true,
      },
      orderBy: [{ payDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(payments);
  } catch (error) {
    return handleRouteError(error, "load salary payments");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateSalaryPaymentInput;

    if (!body.userId || !body.salaryMonth || !body.payDate) {
      return badRequest("userId, salaryMonth, and payDate are required.");
    }

    const computed = summarizeComponents(body.components);
    const salaryPayment = await prisma.salaryPayment.create({
      data: {
        user: { connect: { id: body.userId } },
        salaryMonth: new Date(body.salaryMonth),
        payDate: new Date(body.payDate),
        basicAmount: toNumber(body.basicAmount),
        grossAmount: toOptionalNumber(body.grossAmount) ?? computed.gross,
        deductionAmount: toOptionalNumber(body.deductionAmount) ?? computed.deduction,
        netAmount: toOptionalNumber(body.netAmount) ?? computed.net,
        currencyCode: body.currencyCode ?? "LKR",
        status: body.status ?? "POSTED",
        notes: body.notes ?? undefined,
        ...(body.incomeSourceId ? { incomeSource: { connect: { id: body.incomeSourceId } } } : {}),
        ...(body.linkedTransactionId
          ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
          : {}),
        ...(body.components?.length
          ? {
              components: {
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
      userId: body.userId,
      entityName: "SalaryPayment",
      entityId: salaryPayment.id,
      action: "CREATE",
      description: "Created salary payment record",
      afterData: salaryPayment,
    });

    return NextResponse.json(salaryPayment, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create salary payment");
  }
}
