import { NextResponse } from "next/server";
import db from "../../../db/db";

export async function GET() {
  const stmt = db.prepare("SELECT * FROM shift ORDER BY id DESC");
  const shifts = stmt.all();
  return NextResponse.json(shifts);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { shiftName, startAt, endAt, status, color } = body;

  const stmt = db.prepare(
    "INSERT INTO shift (shiftName, startAt, endAt, status, color) VALUES (?, ?, ?, ?, ?)"
  );
  const result = stmt.run(shiftName, startAt, endAt, status ?? 0, color ?? "#ffffff");

  return NextResponse.json({ id: result.lastInsertRowid, ...body });
}


