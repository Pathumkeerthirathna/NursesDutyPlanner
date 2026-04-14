import { NextRequest, NextResponse } from "next/server";
import db from "../../../../db/db";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // unwrap the promise
  const stmt = db.prepare("SELECT * FROM shift WHERE id = ?");
  const shift = stmt.get(id);
  return NextResponse.json(shift);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ must be Promise
) {
  const { id } = await context.params; // unwrap the promise
  const body = await req.json();
  const { shiftName, startAt, endAt, status, color } = body;

  const stmt = db.prepare(
    "UPDATE shift SET shiftName = ?, startAt = ?, endAt = ?, status = ?, color = ? WHERE id = ?"
  );
  stmt.run(shiftName, startAt, endAt, status ?? 0, color ?? "#ffffff", id);

  return NextResponse.json({ id, ...body });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const stmt = db.prepare("DELETE FROM shift WHERE id = ?");
  stmt.run(id);
  return NextResponse.json({ deletedId: id });
}
