import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateMerchantInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const merchants = await prisma.merchant.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(merchants);
  } catch (error) {
    return handleRouteError(error, "load merchants");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateMerchantInput;

    if (!body.userId || !body.name) {
      return badRequest("userId and name are required.");
    }

    const merchant = await prisma.merchant.create({
      data: {
        user: { connect: { id: body.userId } },
        name: body.name,
        merchantType: body.merchantType,
        contactNo: body.contactNo,
        notes: body.notes,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json(merchant, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create merchant");
  }
}
