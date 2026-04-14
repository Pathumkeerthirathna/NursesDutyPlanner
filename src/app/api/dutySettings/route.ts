import { NextRequest, NextResponse } from "next/server";
import db from "../../../db/db";

// GET current duty setting
export async function GET() {
  const stmt = db.prepare("SELECT * FROM DutySetting LIMIT 1");
  const setting = stmt.get();
  return NextResponse.json(setting);
}

// PUT update duty setting
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { minimumWeeklyHours, weekStart, weekEnd, overTimeRate, dayOffRate } = body;

  const stmt = db.prepare(`
    UPDATE DutySetting 
    SET minimumWeeklyHours = ?, weekStart = ?, weekEnd = ?, overTimeRate = ?, dayOffRate = ?
    WHERE id = (SELECT id FROM DutySetting LIMIT 1)
  `);
  stmt.run(minimumWeeklyHours, weekStart, weekEnd, overTimeRate, dayOffRate);

  return NextResponse.json({ success: true });
}
