import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { badRequest, handleRouteError, omitUndefined, parseDateValue, writeAuditLog } from "@/lib/money/api";
import type { CreateImportJobInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as CreateImportJobInput["status"] | null;

    const jobs = await prisma.importJob.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        status: status ?? undefined,
      }),
      orderBy: [{ createdAt: "desc" }],
    });

    return NextResponse.json(jobs);
  } catch (error) {
    return handleRouteError(error, "load import jobs");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateImportJobInput;

    if (!body.userId || !body.jobType) {
      return badRequest("userId and jobType are required.");
    }

    const job = await prisma.importJob.create({
      data: {
        user: { connect: { id: body.userId } },
        jobType: body.jobType,
        sourceName: body.sourceName ?? undefined,
        fileName: body.fileName ?? undefined,
        status: body.status ?? "PENDING",
        totalRows: body.totalRows ?? 0,
        successRows: body.successRows ?? 0,
        failedRows: body.failedRows ?? 0,
        startedAt: parseDateValue(body.startedAt),
        completedAt: parseDateValue(body.completedAt),
        errorLog: body.errorLog ?? undefined,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "ImportJob",
      entityId: job.id,
      action: "IMPORT",
      description: `Created import job ${job.jobType}`,
      afterData: job,
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create import job");
  }
}
