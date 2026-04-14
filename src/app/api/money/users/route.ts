import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateMoneyUserInput } from "@/types/money";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { profile: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    return handleRouteError(error, "load money users");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateMoneyUserInput;

    if (!body.fullName || !body.email || !body.passwordHash) {
      return badRequest("fullName, email, and passwordHash are required.");
    }

    const data = {
      fullName: body.fullName,
      email: body.email,
      mobileNo: body.mobileNo,
      passwordHash: body.passwordHash,
      isActive: body.isActive ?? true,
      ...(body.profile
        ? {
            profile: {
              create: omitUndefined({
                defaultCurrencyCode: body.profile.defaultCurrencyCode,
                country: body.profile.country,
                salaryDay: body.profile.salaryDay,
                financialMonthStartDay: body.profile.financialMonthStartDay,
                timeZone: body.profile.timeZone,
                occupation: body.profile.occupation,
                employerName: body.profile.employerName,
              }),
            },
          }
        : {}),
    };

    const user = await prisma.user.create({
      data,
      include: { profile: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create money user");
  }
}
