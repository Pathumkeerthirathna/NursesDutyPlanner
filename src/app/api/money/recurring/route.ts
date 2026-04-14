import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateRecurringTemplateInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const templates = await prisma.recurringTransactionTemplate.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
      },
      orderBy: [{ nextRunDate: "asc" }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    return handleRouteError(error, "load recurring templates");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateRecurringTemplateInput;

    if (!body.userId || !body.templateName || !body.kind || !body.nextRunDate) {
      return badRequest("userId, templateName, kind, and nextRunDate are required.");
    }

    const template = await prisma.recurringTransactionTemplate.create({
      data: {
        user: { connect: { id: body.userId } },
        templateName: body.templateName,
        kind: body.kind,
        amount: body.amount,
        frequencyType: body.frequencyType,
        frequencyInterval: body.frequencyInterval ?? 1,
        nextRunDate: new Date(body.nextRunDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        autoPost: body.autoPost ?? false,
        isActive: body.isActive ?? true,
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
      },
      include: {
        fromAccount: true,
        toAccount: true,
        category: true,
        merchant: true,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create recurring template");
  }
}
