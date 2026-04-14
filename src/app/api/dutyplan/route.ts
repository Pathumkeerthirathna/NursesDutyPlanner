import { NextRequest, NextResponse } from "next/server";
import db from "../../../db/db";
import { NextApiRequest, NextApiResponse } from "next";



// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const fromDate = searchParams.get("fromDate");
//   const toDate = searchParams.get("toDate");
//   const shiftIds = searchParams.getAll("shiftIds").map(Number);
//   const dutyTypeIds = searchParams.getAll("dutyTypeIds").map(Number);

//   let query = `
//     SELECT 
//       dp.id,
//       dp.dutyDate,
//       dp.shiftId,
//       s.shiftName,
//       s.color AS shiftColor,
//       dp.startTime,
//       dp.endTime,
//       dp.hours,
//       dp.dutyTypeId,
//       dt.dutyName,
//       dt.color AS dutyColor
//     FROM DutyPlan dp
//     JOIN shift s ON dp.shiftId = s.id
//     JOIN DutyType dt ON dp.dutyTypeId = dt.id
//     WHERE 1=1
//   `;

//   const params: any[] = [];
//   if (fromDate) { query += " AND dp.dutyDate >= ?"; params.push(fromDate); }
//   if (toDate) { query += " AND dp.dutyDate <= ?"; params.push(toDate); }
//   if (shiftIds.length) { query += ` AND dp.shiftId IN (${shiftIds.map(() => "?").join(",")})`; params.push(...shiftIds); }
//   if (dutyTypeIds.length) { query += ` AND dp.dutyTypeId IN (${dutyTypeIds.map(() => "?").join(",")})`; params.push(...dutyTypeIds); }

//   query += " ORDER BY dp.dutyDate DESC, dp.startTime";

//   const stmt = db.prepare(query);
//   const data = stmt.all(...params);

//   return NextResponse.json(data);
// }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1"); // current page
  const pageSize = 30; // 30 days per page

  const shiftIds = searchParams.getAll("shiftIds").map(Number);
  const dutyTypeIds = searchParams.getAll("dutyTypeIds").map(Number);

  // Default: last 30 days from today
  const today = new Date();
  const defaultToDate = today.toISOString().split("T")[0];
  const past30 = new Date();
  past30.setDate(today.getDate() - 29); // 30 days back including today
  const defaultFromDate = past30.toISOString().split("T")[0];

  const fromDate = searchParams.get("fromDate") || defaultFromDate;
  const toDate = searchParams.get("toDate") || defaultToDate;

  let query = `
    SELECT 
      dp.id,
      dp.dutyDate,
      dp.shiftId,
      s.shiftName,
      s.color AS shiftColor,
      dp.startTime,
      dp.endTime,
      dp.hours,
      dp.dutyTypeId,
      dt.dutyName,
      dt.color AS dutyColor
    FROM DutyPlan dp
    JOIN shift s ON dp.shiftId = s.id
    JOIN DutyType dt ON dp.dutyTypeId = dt.id
    WHERE dp.dutyDate BETWEEN ? AND ?
  `;

  const params: unknown[] = [fromDate, toDate];

  if (shiftIds.length) {
    query += ` AND dp.shiftId IN (${shiftIds.map(() => "?").join(",")})`;
    params.push(...shiftIds);
  }

  if (dutyTypeIds.length) {
    query += ` AND dp.dutyTypeId IN (${dutyTypeIds.map(() => "?").join(",")})`;
    params.push(...dutyTypeIds);
  }

  // Count total rows for pagination
  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM (${query})`);
  const countResult = countStmt.get(...params) as { total: number }; // type assertion
  const total = countResult.total;

  // Add pagination
  const offset = (page - 1) * pageSize;
  query += ` ORDER BY dp.dutyDate DESC, dp.startTime LIMIT ? OFFSET ?`;
  params.push(pageSize, offset);

  const stmt = db.prepare(query);
  const data = stmt.all(...params);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });

}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { fromDate, toDate, shiftIds, dutyTypeIds } = req.query;

  let query = `SELECT ... FROM DutyPlan dp JOIN shift s ... JOIN DutyType dt ... WHERE 1=1`;
  const params: unknown[] = [];

  if (fromDate) { query += " AND dp.dutyDate >= ?"; params.push(fromDate); }
  if (toDate) { query += " AND dp.dutyDate <= ?"; params.push(toDate); }
  if (shiftIds) { 
    const ids = Array.isArray(shiftIds) ? shiftIds : [shiftIds];
    query += ` AND dp.shiftId IN (${ids.map(() => '?').join(',')})`; 
    params.push(...ids);
  }
  if (dutyTypeIds) { 
    const ids = Array.isArray(dutyTypeIds) ? dutyTypeIds : [dutyTypeIds];
    query += ` AND dp.dutyTypeId IN (${ids.map(() => '?').join(',')})`; 
    params.push(...ids);
  }

  const stmt = db.prepare(query);
  const data = stmt.all(...params);
  res.status(200).json(data);
}

// POST create new duty
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { dutyDate, shiftId, hours, startTime, endTime, dutyTypeId } = body;

  const stmt = db.prepare(`
    INSERT INTO DutyPlan (dutyDate, shiftId, hours, startTime, endTime, dutyTypeId)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(dutyDate, shiftId, hours, startTime, endTime, dutyTypeId);

  return NextResponse.json({ id: result.lastInsertRowid, ...body });
}
