import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateIncomeSourceInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const source = await prisma.incomeSource.findUnique({
      where: { id },
      include: {
        defaultCategory: true,
        salaryPayments: {
          include: {
            components: true,
          },
          orderBy: [{ payDate: "desc" }],
        },
      },
    });

    if (!source) {
      return notFound("Income source");
    }

    return NextResponse.json(source);
  } catch (error) {
    return handleRouteError(error, "load income source");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.incomeSource.findUnique({ where: { id } });

    if (!current) {
      return notFound("Income source");
    }

    const body = (await req.json()) as UpdateIncomeSourceInput;
    const source = await prisma.incomeSource.update({
      where: { id },
      data: {
        ...omitUndefined({
          sourceName: body.sourceName,
          sourceType: body.sourceType,
          employerName: body.employerName,
          defaultAmount: toOptionalNumber(body.defaultAmount),
          payDay: body.payDay,
          isTaxable: body.isTaxable,
          isActive: body.isActive,
          notes: body.notes,
        }),
        ...(body.defaultCategoryId === null
          ? { defaultCategory: { disconnect: true } }
          : body.defaultCategoryId
            ? { defaultCategory: { connect: { id: body.defaultCategoryId } } }
            : {}),
      },
      include: {
        defaultCategory: true,
      },
    });

    await writeAuditLog({
      userId: source.userId,
      entityName: "IncomeSource",
      entityId: source.id,
      action: "UPDATE",
      description: `Updated income source ${source.sourceName}`,
      beforeData: current,
      afterData: source,
    });

    return NextResponse.json(source);
  } catch (error) {
    return handleRouteError(error, "update income source");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.incomeSource.findUnique({ where: { id } });

    if (!current) {
      return notFound("Income source");
    }

    const source = await prisma.incomeSource.update({
      where: { id },
      data: { isActive: false },
    });

    await writeAuditLog({
      userId: source.userId,
      entityName: "IncomeSource",
      entityId: source.id,
      action: "ARCHIVE",
      description: `Archived income source ${source.sourceName}`,
      beforeData: current,
      afterData: source,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "archive income source");
  }
}
