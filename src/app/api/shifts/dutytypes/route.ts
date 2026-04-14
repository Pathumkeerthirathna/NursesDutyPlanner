import { NextResponse } from "next/server";
import db from "../../../../db/db";

// GET all duty types
export async function GET() {
  const stmt = db.prepare("SELECT * FROM DutyType ORDER BY id DESC");
  const dutyTypes = stmt.all();
  return NextResponse.json(dutyTypes);
}

// POST new duty type
export async function POST(req: Request) {
  const body = await req.json();
  const { dutyName, color, status } = body;

  const stmt = db.prepare(
    "INSERT INTO DutyType (dutyName, color, status) VALUES (?, ?, ?)"
  );
  const result = stmt.run(dutyName, color ?? "#ffffff", status ?? 0);

  return NextResponse.json({ id: result.lastInsertRowid, ...body });
}
