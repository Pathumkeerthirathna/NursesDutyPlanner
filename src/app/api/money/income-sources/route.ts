import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  toOptionalNumber,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateIncomeSourceInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const isActive = searchParams.get("isActive");

    const sources = await prisma.incomeSource.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        isActive: isActive === null ? undefined : isActive === "true",
      }),
      include: {
        defaultCategory: true,
      },
      orderBy: [{ isActive: "desc" }, { sourceName: "asc" }],
    });

    return NextResponse.json(sources);
  } catch (error) {
    return handleRouteError(error, "load income sources");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateIncomeSourceInput;

    if (!body.userId || !body.sourceName) {
      return badRequest("userId and sourceName are required.");
    }

    const source = await prisma.incomeSource.create({
      data: {
        user: { connect: { id: body.userId } },
        sourceName: body.sourceName,
        sourceType: body.sourceType ?? undefined,
        employerName: body.employerName ?? undefined,
        defaultAmount: toOptionalNumber(body.defaultAmount),
        payDay: body.payDay ?? undefined,
        isTaxable: body.isTaxable ?? false,
        isActive: body.isActive ?? true,
        notes: body.notes ?? undefined,
        ...(body.defaultCategoryId
          ? { defaultCategory: { connect: { id: body.defaultCategoryId } } }
          : {}),
      },
      include: {
        defaultCategory: true,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "IncomeSource",
      entityId: source.id,
      action: "CREATE",
      description: `Created income source ${source.sourceName}`,
      afterData: source,
    });

    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create income source");
  }
}
