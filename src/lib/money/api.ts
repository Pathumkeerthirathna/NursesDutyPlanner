import { NextResponse } from "next/server";

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(entity: string) {
  return NextResponse.json({ error: `${entity} not found.` }, { status: 404 });
}

export function handleRouteError(error: unknown, action = "process the request") {
  const details = error instanceof Error ? error.message : "Unknown error";
  console.error(`Failed to ${action}:`, error);

  return NextResponse.json(
    { error: `Failed to ${action}`, details },
    { status: 500 }
  );
}

export function omitUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T;
}

export function parseDateValue(value: string | null | undefined) {
  return value ? new Date(value) : undefined;
}

export function toNumber(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}
