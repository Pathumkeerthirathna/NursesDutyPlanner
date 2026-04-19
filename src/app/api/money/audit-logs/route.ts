import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined } from "@/lib/money/api";
import type { CreateAuditLogInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const entityName = searchParams.get("entityName");

    const logs = await prisma.auditLog.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        entityName: entityName ?? undefined,
      }),
      orderBy: [{ createdAt: "desc" }],
      take: 500,
    });

    return NextResponse.json(logs);
  } catch (error) {
    return handleRouteError(error, "load audit logs");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateAuditLogInput;

    if (!body.entityName || !body.action) {
      return badRequest("entityName and action are required.");
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: body.userId ?? undefined,
        entityName: body.entityName,
        entityId: body.entityId ?? undefined,
        action: body.action,
        description: body.description ?? undefined,
        beforeData: body.beforeData ?? undefined,
        afterData: body.afterData ?? undefined,
        createdBy: body.createdBy ?? undefined,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create audit log");
  }
}
