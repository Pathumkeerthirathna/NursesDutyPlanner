import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError, notFound, omitUndefined, parseDateValue, toOptionalNumber, writeAuditLog } from "@/lib/money/api";
import type { UpdateReimbursementClaimInput } from "@/types/money";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const claim = await prisma.reimbursementClaim.findUnique({
      where: { id },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    if (!claim) {
      return notFound("Reimbursement claim");
    }

    return NextResponse.json(claim);
  } catch (error) {
    return handleRouteError(error, "load reimbursement claim");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.reimbursementClaim.findUnique({ where: { id } });

    if (!current) {
      return notFound("Reimbursement claim");
    }

    const body = (await req.json()) as UpdateReimbursementClaimInput;
    const claim = await prisma.reimbursementClaim.update({
      where: { id },
      data: {
        ...omitUndefined({
          claimNo: body.claimNo,
          title: body.title,
          description: body.description,
          claimDate: body.claimDate ? new Date(body.claimDate) : undefined,
          amountClaimed: toOptionalNumber(body.amountClaimed),
          amountReceived: toOptionalNumber(body.amountReceived),
          receivedDate: body.receivedDate !== undefined ? parseDateValue(body.receivedDate) : undefined,
          employerName: body.employerName,
          isTaxDeductible: body.isTaxDeductible,
          status: body.status,
          notes: body.notes,
        }),
        ...(body.categoryId === null
          ? { category: { disconnect: true } }
          : body.categoryId
            ? { category: { connect: { id: body.categoryId } } }
            : {}),
        ...(body.linkedTransactionId === null
          ? { linkedTransaction: { disconnect: true } }
          : body.linkedTransactionId
            ? { linkedTransaction: { connect: { id: body.linkedTransactionId } } }
            : {}),
      },
      include: {
        category: true,
        linkedTransaction: true,
      },
    });

    await writeAuditLog({
      userId: claim.userId,
      entityName: "ReimbursementClaim",
      entityId: claim.id,
      action: "UPDATE",
      description: `Updated reimbursement claim ${claim.claimNo}`,
      beforeData: current,
      afterData: claim,
    });

    return NextResponse.json(claim);
  } catch (error) {
    return handleRouteError(error, "update reimbursement claim");
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const current = await prisma.reimbursementClaim.findUnique({ where: { id } });

    if (!current) {
      return notFound("Reimbursement claim");
    }

    const claim = await prisma.reimbursementClaim.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await writeAuditLog({
      userId: claim.userId,
      entityName: "ReimbursementClaim",
      entityId: claim.id,
      action: "ARCHIVE",
      description: `Cancelled reimbursement claim ${claim.claimNo}`,
      beforeData: current,
      afterData: claim,
    });

    return NextResponse.json({ deletedId: id, archived: true });
  } catch (error) {
    return handleRouteError(error, "cancel reimbursement claim");
  }
}
