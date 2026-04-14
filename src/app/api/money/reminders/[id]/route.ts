import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateBillReminderInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const reminder = await prisma.billReminder.findUnique({
      where: { id },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    if (!reminder) {
      return notFound("Reminder");
    }

    return NextResponse.json(reminder);
  } catch (error) {
    return handleRouteError(error, "load reminder");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateBillReminderInput;

    const reminder = await prisma.billReminder.update({
      where: { id },
      data: {
        ...omitUndefined({
          reminderTitle: body.reminderTitle,
          amountExpected: body.amountExpected,
          dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
          reminderDaysBefore: body.reminderDaysBefore,
          isPaid: body.isPaid,
          status: body.status,
        }),
        ...(body.categoryId === null
          ? { category: { disconnect: true } }
          : body.categoryId
            ? { category: { connect: { id: body.categoryId } } }
            : {}),
        ...(body.linkedTransactionId === null
          ? { linkedTransaction: { disconnect: true } }
          : body.linkedTransactionId
            ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
            : {}),
      },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    return NextResponse.json(reminder);
  } catch (error) {
    return handleRouteError(error, "update reminder");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.billReminder.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete reminder");
  }
}
