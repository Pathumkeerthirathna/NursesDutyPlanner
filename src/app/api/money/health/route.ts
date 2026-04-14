import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleRouteError } from "@/lib/money/api";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      service: "money-api",
      database: "connected",
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return handleRouteError(error, "check money database health");
  }
}
