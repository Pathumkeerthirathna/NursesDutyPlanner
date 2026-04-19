import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  badRequest,
  handleRouteError,
  omitUndefined,
  parseDateValue,
  toNumber,
  writeAuditLog,
} from "@/lib/money/api";
import type { CreateReimbursementClaimInput } from "@/types/money";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status") as CreateReimbursementClaimInput["status"] | null;

    const claims = await prisma.reimbursementClaim.findMany({
      where: omitUndefined({
        userId: userId ?? undefined,
        status: status ?? undefined,
      }),
      include: {
        category: true,
        linkedTransaction: true,
      },
      orderBy: [{ claimDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(claims);
  } catch (error) {
    return handleRouteError(error, "load reimbursements");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateReimbursementClaimInput;

    if (!body.userId || !body.claimNo || !body.title || !body.claimDate) {
      return badRequest("userId, claimNo, title, and claimDate are required.");
    }

    const claim = await prisma.reimbursementClaim.create({
      data: {
        user: { connect: { id: body.userId } },
        claimNo: body.claimNo,
        title: body.title,
        description: body.description ?? undefined,
        claimDate: new Date(body.claimDate),
        amountClaimed: body.amountClaimed,
        amountReceived: toNumber(body.amountReceived),
        receivedDate: parseDateValue(body.receivedDate),
        employerName: body.employerName ?? undefined,
        isTaxDeductible: body.isTaxDeductible ?? false,
        status: body.status ?? "PENDING",
        notes: body.notes ?? undefined,
        ...(body.categoryId ? { category: { connect: { id: body.categoryId } } } : {}),
        ...(body.linkedTransactionId
          ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
          : {}),
      },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    await writeAuditLog({
      userId: body.userId,
      entityName: "ReimbursementClaim",
      entityId: claim.id,
      action: "CREATE",
      description: `Created reimbursement claim ${claim.claimNo}`,
      afterData: claim,
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "create reimbursement claim");
  }
}
