import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateRecurringTemplateInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const template = await prisma.recurringTransactionTemplate.findUnique({
      where: { id },
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
      },
    });

    if (!template) {
      return notFound("Recurring template");
    }

    return NextResponse.json(template);
  } catch (error) {
    return handleRouteError(error, "load recurring template");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateRecurringTemplateInput;

    const data: Record<string, unknown> = {
      ...omitUndefined({
        templateName: body.templateName,
        kind: body.kind,
        amount: body.amount,
        frequencyType: body.frequencyType,
        frequencyInterval: body.frequencyInterval,
        nextRunDate: body.nextRunDate ? new Date(body.nextRunDate) : undefined,
        endDate:
          body.endDate === null
            ? null
            : body.endDate
              ? new Date(body.endDate)
              : undefined,
        autoPost: body.autoPost,
        isActive: body.isActive,
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
    };

    const template = await prisma.recurringTransactionTemplate.update({
      where: { id },
      data,
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    return handleRouteError(error, "update recurring template");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.recurringTransactionTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "delete recurring template");
  }
}
