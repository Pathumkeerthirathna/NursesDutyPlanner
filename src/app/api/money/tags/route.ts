import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateTagInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const tags = await prisma.tag.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
      }),
      orderBy: [{ name: "asc" }],
    });

    return NextResponse.json(tags);
  } catch (error) {
    return handleRouteError(error, "load tags");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTagInput;

    if (!body.userId || !body.name) {
      return badRequest("userId and name are required.");
    }

    const tag = await prisma.tag.create({
      data: {
        user: { connect: { id: body.userId } },
        name: body.name,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create tag");
  }
}
