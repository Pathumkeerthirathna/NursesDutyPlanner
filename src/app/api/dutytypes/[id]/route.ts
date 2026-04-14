// import { NextRequest, NextResponse } from "next/server";
// import db from "../../../../db/db";

// // GET single duty type
// export async function GET(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await context.params;
//   const stmt = db.prepare("SELECT * FROM DutyType WHERE id = ?");
//   const dutyType = stmt.get(id);
//   return NextResponse.json(dutyType);
// }

// // PUT update duty type
// export async function PUT(
//   req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {

//   console.log("PUT CALLED");

//   const { id } = await context.params;
//   const body = await req.json();
//   const { dutyName, color, status } = body;

//   const stmt = db.prepare(
//     "UPDATE DutyType SET dutyName = ?, color = ?, status = ? WHERE id = ?"
//   );
//   stmt.run(dutyName, color ?? "#ffffff", status ?? 0, id);

//   return NextResponse.json({ id, ...body });
// }

// // DELETE duty type
// // export async function DELETE(
// //   req: NextRequest,
// //   context: { params: Promise<{ id: string }> }
// // ) {


// //   console.log("DELETE CALLED");
// //   console.log(context.params);

// //   const { id } = await context.params;
// //   const stmt = db.prepare("DELETE FROM DutyType WHERE id = ?");
// //   stmt.run(id);

// //   return NextResponse.json({ deletedId: id });
// // }

// export async function DELETE(
//   req: NextRequest,
//   context: { params: { id: string } }
// ) {
//   console.log("DELETE CALLED");

//   const { id } = context.params;

//   try {
//     const stmt = db.prepare("DELETE FROM DutyType WHERE id = ?");
//     stmt.run(id);

//     return NextResponse.json({ deletedId: id, message: "Deleted successfully" });
//   } catch (error: any) {
//     console.error("Error deleting duty type:", error);
//     return NextResponse.json(
//       { error: "Failed to delete duty type", details: error.message },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import db from "../../../../db/db";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Unknown error";

// ✅ GET single duty type
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const stmt = db.prepare("SELECT * FROM DutyType WHERE id = ?");
    const dutyType = stmt.get(id);
    return NextResponse.json(dutyType);
  } catch (error: unknown) {
    console.error("Error fetching duty type:", error);
    return NextResponse.json(
      { error: "Failed to fetch duty type", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// ✅ PUT update duty type
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  const { dutyName, color, status } = body;

  try {
    const stmt = db.prepare(
      "UPDATE DutyType SET dutyName = ?, color = ?, status = ? WHERE id = ?"
    );
    stmt.run(dutyName, color ?? "#ffffff", status ?? 0, id);

    return NextResponse.json({ id, ...body });
  } catch (error: unknown) {
    console.error("Error updating duty type:", error);
    return NextResponse.json(
      { error: "Failed to update duty type", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// ✅ DELETE duty type
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const stmt = db.prepare("DELETE FROM DutyType WHERE id = ?");
    stmt.run(id);

    return NextResponse.json({ deletedId: id, message: "Deleted successfully" });
  } catch (error: unknown) {
    console.error("Error deleting duty type:", error);
    return NextResponse.json(
      { error: "Failed to delete duty type", details: getErrorMessage(error) },
      { status: 500 }
    );
  }
}
