// 🗄️ เชื่อม Turso (libSQL) — ทุก query กรองตาม user_id (แต่ละคนเห็นเฉพาะงานตัวเอง)

import { createClient } from "@libsql/client";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// เตรียม database: สร้างตาราง (มี user_id) + เพิ่มคอลัมน์ให้ตารางเก่า
const ready = (async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      text    TEXT    NOT NULL,
      done    INTEGER NOT NULL DEFAULT 0,
      user_id TEXT
    )
  `);
  // ตารางเก่า (สร้างก่อนมี auth) ยังไม่มีคอลัมน์ user_id → เพิ่มให้
  // ถ้ามีแล้วจะ error → catch ทิ้งไปเลย (ไม่เป็นไร)
  try {
    await client.execute("ALTER TABLE todos ADD COLUMN user_id TEXT");
  } catch {
    // คอลัมน์มีอยู่แล้ว — ข้าม
  }
})();

type Row = { id: number; text: string; done: number };
const toTodo = (r: Row): Todo => ({
  id: Number(r.id),
  text: String(r.text),
  done: Number(r.done) === 1,
});

// ───────── ทุกฟังก์ชันรับ userId เพื่อกรองเฉพาะงานของคนนั้น ─────────

export async function getTodos(userId: string): Promise<Todo[]> {
  await ready;
  const rs = await client.execute({
    sql: "SELECT * FROM todos WHERE user_id = ? ORDER BY id",
    args: [userId],
  });
  return rs.rows.map((r) => toTodo(r as unknown as Row));
}

// เช็ค id + user_id คู่กัน → กันคนอื่นเปิดดูงานเราด้วยการเดา id
export async function getTodoById(
  userId: string,
  id: number
): Promise<Todo | undefined> {
  await ready;
  const rs = await client.execute({
    sql: "SELECT * FROM todos WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
  const row = rs.rows[0];
  return row ? toTodo(row as unknown as Row) : undefined;
}

export async function getStats(userId: string): Promise<{
  total: number;
  done: number;
  pending: number;
}> {
  await ready;
  const rs = await client.execute({
    sql: "SELECT COUNT(*) AS total, COALESCE(SUM(done), 0) AS done FROM todos WHERE user_id = ?",
    args: [userId],
  });
  const total = Number(rs.rows[0].total);
  const done = Number(rs.rows[0].done);
  return { total, done, pending: total - done };
}

export async function todoExists(userId: string, text: string): Promise<boolean> {
  await ready;
  const rs = await client.execute({
    sql: "SELECT COUNT(*) AS n FROM todos WHERE text = ? AND user_id = ?",
    args: [text, userId],
  });
  return Number(rs.rows[0].n) > 0;
}

export async function insertTodo(userId: string, text: string): Promise<void> {
  await ready;
  await client.execute({
    sql: "INSERT INTO todos (text, done, user_id) VALUES (?, 0, ?)",
    args: [text, userId],
  });
}

// UPDATE/DELETE ใส่ AND user_id = ? → แก้/ลบได้เฉพาะงานตัวเอง (คนอื่นแตะไม่ได้)
export async function toggleTodoDone(userId: string, id: number): Promise<void> {
  await ready;
  await client.execute({
    sql: "UPDATE todos SET done = NOT done WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
}

export async function updateTodoText(
  userId: string,
  id: number,
  text: string
): Promise<void> {
  await ready;
  await client.execute({
    sql: "UPDATE todos SET text = ? WHERE id = ? AND user_id = ?",
    args: [text, id, userId],
  });
}

export async function deleteTodoById(userId: string, id: number): Promise<void> {
  await ready;
  await client.execute({
    sql: "DELETE FROM todos WHERE id = ? AND user_id = ?",
    args: [id, userId],
  });
}
