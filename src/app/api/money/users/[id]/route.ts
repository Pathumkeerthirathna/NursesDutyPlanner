import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateMoneyUserInput } from "@/types/money";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      return notFound("User");
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleRouteError(error, "load money user");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateMoneyUserInput;

    const data = omitUndefined({
      fullName: body.fullName,
      email: body.email,
      mobileNo: body.mobileNo,
      passwordHash: body.passwordHash,
      isActive: body.isActive,
    }) as Record<string, unknown>;

    if (body.profile) {
      data.profile = {
        upsert: {
          create: omitUndefined({
            defaultCurrencyCode: body.profile.defaultCurrencyCode,
            country: body.profile.country,
            salaryDay: body.profile.salaryDay,
            financialMonthStartDay: body.profile.financialMonthStartDay,
            timeZone: body.profile.timeZone,
            occupation: body.profile.occupation,
            employerName: body.profile.employerName,
          }),
          update: omitUndefined({
            defaultCurrencyCode: body.profile.defaultCurrencyCode,
            country: body.profile.country,
            salaryDay: body.profile.salaryDay,
            financialMonthStartDay: body.profile.financialMonthStartDay,
            timeZone: body.profile.timeZone,
            occupation: body.profile.occupation,
            employerName: body.profile.employerName,
          }),
        },
      };
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return handleRouteError(error, "update money user");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete money user");
  }
}
