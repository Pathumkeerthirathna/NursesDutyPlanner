import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, parseDateValue, writeAuditLog } from "@/lib/money/api";
import type { UpdateImportJobInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const job = await prisma.importJob.findUnique({ where: { id } });

    if (!job) {
      return notFound("Import job");
    }

    return NextResponse.json(job);
  } catch (error) {
    return handleRouteError(error, "load import job");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.importJob.findUnique({ where: { id } });

    if (!current) {
      return notFound("Import job");
    }

    const body = (await req.json()) as UpdateImportJobInput;
    const job = await prisma.importJob.update({
      where: { id },
      data: omitUndefined({
        jobType: body.jobType,
        sourceName: body.sourceName,
        fileName: body.fileName,
        status: body.status,
        totalRows: body.totalRows,
        successRows: body.successRows,
        failedRows: body.failedRows,
        startedAt: body.startedAt !== undefined ? parseDateValue(body.startedAt) : undefined,
        completedAt: body.completedAt !== undefined ? parseDateValue(body.completedAt) : undefined,
        errorLog: body.errorLog,
      }),
    });

    await writeAuditLog({
      userId: job.userId,
      entityName: "ImportJob",
      entityId: job.id,
      action: "UPDATE",
      description: `Updated import job ${job.jobType}`,
      beforeData: current,
      afterData: job,
    });

    return NextResponse.json(job);
  } catch (error) {
    return handleRouteError(error, "update import job");
  }
}
