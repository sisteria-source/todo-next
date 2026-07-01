// 🗄️ เชื่อม Turso (libSQL) — SQLite เวอร์ชัน cloud ทำงานบน serverless ได้
//    ⚠️ ต่อผ่านเครือข่าย → ทุกฟังก์ชันเป็น async (ต้อง await)
//    credentials อ่านจาก .env.local (local) / Environment Variables (Vercel)

import { createClient } from "@libsql/client";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

// สร้าง client เชื่อม Turso — url + token มาจาก environment variables (ไม่ hard-code!)
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// เตรียม database ครั้งเดียวตอนโหลดโมดูล: สร้างตาราง + ใส่ข้อมูลตั้งต้น (ถ้าว่าง)
// เก็บเป็น promise → ทุกฟังก์ชัน await ก่อน เพื่อให้แน่ใจว่าตารางพร้อมแล้ว
const ready = (async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT    NOT NULL,
      done INTEGER NOT NULL DEFAULT 0
    )
  `);
  const rs = await client.execute("SELECT COUNT(*) AS n FROM todos");
  if (Number(rs.rows[0].n) === 0) {
    await client.batch([
      { sql: "INSERT INTO todos (text, done) VALUES (?, ?)", args: ["เรียน Next.js routing", 1] },
      { sql: "INSERT INTO todos (text, done) VALUES (?, ?)", args: ["เข้าใจ Server Component", 0] },
      { sql: "INSERT INTO todos (text, done) VALUES (?, ?)", args: ["ทำหน้า detail ต่อ", 0] },
    ]);
  }
})();

// แถวดิบจาก Turso → แปลงเป็น Todo (done เลข 0/1 → boolean)
type Row = { id: number; text: string; done: number };
const toTodo = (r: Row): Todo => ({
  id: Number(r.id),
  text: String(r.text),
  done: Number(r.done) === 1,
});

// ───────── ฟังก์ชัน query (ตอนนี้เป็น async ทั้งหมด) ─────────

export async function getTodos(): Promise<Todo[]> {
  await ready;
  const rs = await client.execute("SELECT * FROM todos ORDER BY id");
  return rs.rows.map((r) => toTodo(r as unknown as Row));
}

export async function getTodoById(id: number): Promise<Todo | undefined> {
  await ready;
  const rs = await client.execute({
    sql: "SELECT * FROM todos WHERE id = ?",
    args: [id],
  });
  const row = rs.rows[0];
  return row ? toTodo(row as unknown as Row) : undefined;
}

export async function getStats(): Promise<{
  total: number;
  done: number;
  pending: number;
}> {
  await ready;
  const totalRs = await client.execute("SELECT COUNT(*) AS n FROM todos");
  const doneRs = await client.execute(
    "SELECT COUNT(*) AS n FROM todos WHERE done = 1"
  );
  const total = Number(totalRs.rows[0].n);
  const done = Number(doneRs.rows[0].n);
  return { total, done, pending: total - done };
}

export async function insertTodo(text: string): Promise<void> {
  await ready;
  await client.execute({
    sql: "INSERT INTO todos (text, done) VALUES (?, 0)",
    args: [text],
  });
}

export async function toggleTodoDone(id: number): Promise<void> {
  await ready;
  await client.execute({
    sql: "UPDATE todos SET done = NOT done WHERE id = ?",
    args: [id],
  });
}

export async function updateTodoText(id: number, text: string): Promise<void> {
  await ready;
  await client.execute({
    sql: "UPDATE todos SET text = ? WHERE id = ?",
    args: [text, id],
  });
}

export async function deleteTodoById(id: number): Promise<void> {
  await ready;
  await client.execute({
    sql: "DELETE FROM todos WHERE id = ?",
    args: [id],
  });
}
