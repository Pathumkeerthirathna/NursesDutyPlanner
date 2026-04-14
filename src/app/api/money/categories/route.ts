import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateCategoryInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") as CreateCategoryInput["type"] | null;

    const where = omitUndefined({
      userId: userId ?? undefined,
      type: type ?? undefined,
    });

    const categories = await prisma.category.findMany({
      where,
      include: {
        parentCategory: true,
        subCategories: true,
      },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleRouteError(error, "load categories");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateCategoryInput;

    if (!body.userId || !body.type || !body.name) {
      return badRequest("userId, type, and name are required.");
    }

    const category = await prisma.category.create({
      data: {
        user: { connect: { id: body.userId } },
        type: body.type,
        name: body.name,
        icon: body.icon,
        colorCode: body.colorCode,
        sortOrder: body.sortOrder ?? 0,
        isSystemDefined: body.isSystemDefined ?? false,
        isActive: body.isActive ?? true,
        ...(body.parentCategoryId
          ? { parentCategory: { connect: { id: body.parentCategoryId } } }
          : {}),
      },
      include: {
        parentCategory: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create category");
  }
}
