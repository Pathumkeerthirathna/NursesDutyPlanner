import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateBillReminderInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const reminders = await prisma.billReminder.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      include: {
        category: true,
        linkedTransaction: true,
      },
      orderBy: [{ dueDate: "asc" }],
    });

    return NextResponse.json(reminders);
  } catch (error) {
    return handleRouteError(error, "load reminders");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBillReminderInput;

    if (!body.userId || !body.reminderTitle || !body.dueDate) {
      return badRequest("userId, reminderTitle, and dueDate are required.");
    }

    const reminder = await prisma.billReminder.create({
      data: {
        user: { connect: { id: body.userId } },
        reminderTitle: body.reminderTitle,
        amountExpected: body.amountExpected,
        dueDate: new Date(body.dueDate),
        reminderDaysBefore: body.reminderDaysBefore ?? 1,
        isPaid: body.isPaid ?? false,
        status: body.status ?? "PENDING",
        ...(body.categoryId
          ? { category: { connect: { id: body.categoryId } } }
          : {}),
        ...(body.linkedTransactionId
          ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
          : {}),
      },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    return NextResponse.json(reminder, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create reminder");
  }
}
