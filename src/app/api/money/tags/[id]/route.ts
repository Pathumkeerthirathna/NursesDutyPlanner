import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateTagInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const tag = await prisma.tag.findUnique({ where: { id } });

    if (!tag) {
      return notFound("Tag");
    }

    return NextResponse.json(tag);
  } catch (error) {
    return handleRouteError(error, "load tag");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateTagInput;

    const tag = await prisma.tag.update({
      where: { id },
      data: omitUndefined({
        name: body.name,
      }),
    });

    return NextResponse.json(tag);
  } catch (error) {
    return handleRouteError(error, "update tag");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.tag.delete({ where: { id } });

    return NextResponse.json({ deletedId: id });
  } catch (error) {
    return handleRouteError(error, "delete tag");
  }
}
