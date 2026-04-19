import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined } from "@/lib/money/api";
import type { UpdateCategoryInput } from "@/types/money";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parentCategory: true,
        subCategories: true,
      },
    });

    if (!category) {
      return notFound("Category");
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleRouteError(error, "load category");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateCategoryInput;

    const data = {
      ...omitUndefined({
        type: body.type,
        name: body.name,
        icon: body.icon,
        colorCode: body.colorCode,
        sortOrder: body.sortOrder,
        isSystemDefined: body.isSystemDefined,
        isActive: body.isActive,
      }),
      ...(body.parentCategoryId === null
        ? { parentCategory: { disconnect: true } }
        : body.parentCategoryId
          ? { parentCategory: { connect: { id: body.parentCategoryId } } }
          : {}),
    };

    const category = await prisma.category.update({
      where: { id },
      data,
      include: {
        parentCategory: true,
        subCategories: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return handleRouteError(error, "update category");
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "delete category");
  }
}
