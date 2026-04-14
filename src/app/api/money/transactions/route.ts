import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  parseDateValue,
} from "@/lib/money/api";
import type { CreateTransactionInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const kind = searchParams.get("kind") as CreateTransactionInput["kind"] | null;
    const status = searchParams.get("status") as CreateTransactionInput["status"] | null;
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    if (!userId) {
      return badRequest("userId is required.");
    }

    const transactionDate =
      fromDate || toDate
        ? omitUndefined({
            gte: parseDateValue(fromDate),
            lte: parseDateValue(toDate),
          })
        : undefined;

    const transactions = await prisma.transaction.findMany({
      where: omitUndefined({
        userId,
        kind: kind ?? undefined,
        status: status ?? undefined,
        transactionDate,
      }),
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
      orderBy: [{ transactionDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(transactions);
  } catch (error) {
    return handleRouteError(error, "load transactions");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTransactionInput;

    if (!body.userId || !body.transactionNo || !body.transactionDate || !body.kind) {
      return badRequest(
        "userId, transactionNo, transactionDate, and kind are required."
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        user: { connect: { id: body.userId } },
        transactionNo: body.transactionNo,
        transactionDate: new Date(body.transactionDate),
        postedDate: body.postedDate ? new Date(body.postedDate) : undefined,
        kind: body.kind,
        status: body.status ?? "POSTED",
        amount: body.amount,
        currencyCode: body.currencyCode ?? "LKR",
        exchangeRate: body.exchangeRate ?? 1,
        referenceNo: body.referenceNo,
        notes: body.notes,
        paymentMethod: body.paymentMethod,
        location: body.location,
        isRecurringGenerated: body.isRecurringGenerated ?? false,
        ...(body.fromAccountId
          ? { fromAccount: { connect: { id: body.fromAccountId } } }
          : {}),
        ...(body.toAccountId
          ? { toAccount: { connect: { id: body.toAccountId } } }
          : {}),
        ...(body.categoryId
          ? { category: { connect: { id: body.categoryId } } }
          : {}),
        ...(body.merchantId
          ? { merchant: { connect: { id: body.merchantId } } }
          : {}),
        ...(body.recurringTemplateId
          ? {
              recurringTemplate: {
                connect: { id: body.recurringTemplateId },
              },
            }
          : {}),
        ...(body.tagIds?.length
          ? {
              tags: {
                create: body.tagIds.map((tagId) => ({
                  tag: { connect: { id: tagId } },
                })),
              },
            }
          : {}),
      },
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

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create transaction");
  }
}
