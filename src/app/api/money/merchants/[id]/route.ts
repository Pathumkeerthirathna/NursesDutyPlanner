import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateMerchantInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const merchant = await prisma.merchant.findUnique({ where: { id } });

    if (!merchant) {
      return notFound("Merchant");
    }

    return NextResponse.json(merchant);
  } catch (error) {
    return handleRouteError(error, "load merchant");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateMerchantInput;

    const merchant = await prisma.merchant.update({
      where: { id },
      data: omitUndefined({
        name: body.name,
        merchantType: body.merchantType,
        contactNo: body.contactNo,
        notes: body.notes,
        isActive: body.isActive,
      }),
    });

    return NextResponse.json(merchant);
  } catch (error) {
    return handleRouteError(error, "update merchant");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.merchant.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "delete merchant");
  }
}
