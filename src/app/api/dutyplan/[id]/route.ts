import { NextRequest, NextResponse } from "next/server";
import db from "../../../../db/db";

// GET single duty
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const stmt = db.prepare("SELECT * FROM DutyPlan WHERE id = ?");
  const duty = stmt.get(id);
  return NextResponse.json(duty);
}

// PUT update duty
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json();
  const { dutyDate, shiftId, hours, startTime, endTime, dutyTypeId } = body;

  const stmt = db.prepare(`
    UPDATE DutyPlan SET dutyDate = ?, shiftId = ?, hours = ?, startTime = ?, endTime = ?, dutyTypeId = ?
    WHERE id = ?
  `);
  stmt.run(dutyDate, shiftId, hours, startTime, endTime, dutyTypeId, id);

  return NextResponse.json({ id, ...body });
}

// DELETE duty
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const stmt = db.prepare("DELETE FROM DutyPlan WHERE id = ?");
  stmt.run(id);

  return NextResponse.json({ deletedId: id });
}
