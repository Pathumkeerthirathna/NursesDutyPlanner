import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateTransactionInput } from "@/types/money";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!transaction) {
      return notFound("Transaction");
    }

    return NextResponse.json(transaction);
  } catch (error) {
    return handleRouteError(error, "load transaction");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateTransactionInput;

    const data: Record<string, unknown> = {
      ...omitUndefined({
        transactionNo: body.transactionNo,
        transactionDate: body.transactionDate
          ? new Date(body.transactionDate)
          : undefined,
        postedDate:
          body.postedDate === null
            ? null
            : body.postedDate
              ? new Date(body.postedDate)
              : undefined,
        kind: body.kind,
        status: body.status,
        amount: body.amount,
        currencyCode: body.currencyCode,
        exchangeRate: body.exchangeRate,
        referenceNo: body.referenceNo,
        notes: body.notes,
        paymentMethod: body.paymentMethod,
        location: body.location,
        isRecurringGenerated: body.isRecurringGenerated,
      }),
      ...(body.fromAccountId === null
        ? { fromAccount: { disconnect: true } }
        : body.fromAccountId
          ? { fromAccount: { connect: { id: body.fromAccountId } } }
          : {}),
      ...(body.toAccountId === null
        ? { toAccount: { disconnect: true } }
        : body.toAccountId
          ? { toAccount: { connect: { id: body.toAccountId } } }
          : {}),
      ...(body.categoryId === null
        ? { category: { disconnect: true } }
        : body.categoryId
          ? { category: { connect: { id: body.categoryId } } }
          : {}),
      ...(body.merchantId === null
        ? { merchant: { disconnect: true } }
        : body.merchantId
          ? { merchant: { connect: { id: body.merchantId } } }
          : {}),
      ...(body.recurringTemplateId === null
        ? { recurringTemplate: { disconnect: true } }
        : body.recurringTemplateId
          ? { recurringTemplate: { connect: { id: body.recurringTemplateId } } }
          : {}),
    };

    if (body.tagIds) {
      data.tags = {
        deleteMany: {},
        create: body.tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data,
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    return handleRouteError(error, "update transaction");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.transaction.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete transaction");
  }
}
