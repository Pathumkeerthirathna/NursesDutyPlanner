import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../db/db";

type DashboardRow = {
  shiftName: string;
  dutyName: string;
  dutyCount: number;
};

type DutyTypeSummary = {
  name: string;
  count: number;
};

type ShiftSummary = {
  shiftName: string;
  count: number;
  dutyTypes: DutyTypeSummary[];
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fromDate = searchParams.get("fromDate");
  const toDate = searchParams.get("toDate");

  let sql = `
    SELECT 
      s.shiftName,
      dt.dutyName,
      COUNT(dp.id) AS dutyCount
    FROM DutyPlan dp
    JOIN Shift s ON dp.shiftId = s.id
    JOIN DutyType dt ON dp.dutyTypeId = dt.id
    WHERE 1=1
  `;

  const params: unknown[] = [];

  if (fromDate && toDate) {
    sql += ` AND dp.dutyDate BETWEEN ? AND ?`;
    params.push(fromDate, toDate);
  }

  sql += `
    GROUP BY s.shiftName, dt.dutyName
    ORDER BY s.shiftName, dt.dutyName
  `;

  try {
    let totalHoursSql = `SELECT SUM(hours) as totalHours FROM DutyPlan WHERE 1=1`;
    if (fromDate && toDate) {
      totalHoursSql += ` AND dutyDate BETWEEN ? AND ?`;
    }

    const totalHoursRow = query(totalHoursSql, params) as { totalHours: number }[];
    const totalHours = totalHoursRow[0]?.totalHours || 0;

    const dutyTypeSql = `
      SELECT dt.dutyName AS name, COUNT(dp.id) AS count
      FROM DutyPlan dp
      JOIN DutyType dt ON dp.dutyTypeId = dt.id
      WHERE 1=1
      ${fromDate && toDate ? "AND dp.dutyDate BETWEEN ? AND ?" : ""}
      GROUP BY dt.dutyName
      ORDER BY dt.dutyName
    `;

    const totalDutyTypes = query(dutyTypeSql, params) as DutyTypeSummary[];
    const rows = query(sql, params) as DashboardRow[];

    const grouped = rows.reduce<ShiftSummary[]>((acc, row) => {
      let shift = acc.find((item) => item.shiftName === row.shiftName);

      if (!shift) {
        shift = { shiftName: row.shiftName, count: 0, dutyTypes: [] };
        acc.push(shift);
      }

      shift.dutyTypes.push({
        name: row.dutyName,
        count: row.dutyCount,
      });

      shift.count += row.dutyCount;
      return acc;
    }, []);

    const result = [
      { shiftName: "Total Hours", count: totalHours, dutyTypes: totalDutyTypes },
      ...grouped,
    ];

    return NextResponse.json(result);
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Unknown error";
    console.error("Error loading duty summary:", error);
    return NextResponse.json(
      { error: "Failed to load duty summary", details },
      { status: 500 }
    );
  }
}
