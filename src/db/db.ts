import Database from "better-sqlite3";
import path from "path";

const dbpath = path.join(process.cwd(), "db", "database.db");
const db = new Database(dbpath);

export function query(sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function run(sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

export default db;