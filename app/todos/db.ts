// 🗄️ เชื่อม Turso + query ด้วย Drizzle ORM (type-safe)

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { and, eq, sql } from "drizzle-orm";
import { todos } from "./schema";

export type Todo = { id: number; text: string; done: boolean };

// client ดิบ (@libsql) ใช้ตอนสร้างตาราง + เอาไปห่อด้วย drizzle สำหรับ query
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

// สร้างตารางครั้งเดียว (ยังใช้ raw SQL — Drizzle เน้นที่ "query" ส่วน schema จริงจังใช้ drizzle-kit)
const ready = (async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      text    TEXT    NOT NULL,
      done    INTEGER NOT NULL DEFAULT 0,
      user_id TEXT
    )
  `);
  try {
    await client.execute("ALTER TABLE todos ADD COLUMN user_id TEXT");
  } catch {
    // คอลัมน์มีอยู่แล้ว — ข้าม
  }
})();

// ───────── query ด้วย Drizzle (พิมพ์ชื่อคอลัมน์ผิด = ฟ้องทันที + autocomplete) ─────────

export async function getTodos(userId: string): Promise<Todo[]> {
  await ready;
  // select เฉพาะคอลัมน์ที่ต้องส่งให้ client (ไม่ส่ง user_id ออกไป)
  return db
    .select({ id: todos.id, text: todos.text, done: todos.done })
    .from(todos)
    .where(eq(todos.userId, userId))
    .orderBy(todos.id);
}

export async function getTodoById(
  userId: string,
  id: number
): Promise<Todo | undefined> {
  await ready;
  const rows = await db
    .select({ id: todos.id, text: todos.text, done: todos.done })
    .from(todos)
    // and(...) = เงื่อนไขหลายอันต้องจริงทั้งหมด (id ตรง "และ" เป็นของ user นี้)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
  return rows[0];
}

export async function getStats(userId: string): Promise<{
  total: number;
  done: number;
  pending: number;
}> {
  await ready;
  // การนับ/รวม (aggregate) ใช้ sql`` ช่วย — Drizzle drop ลงไปเขียน SQL ตรงได้เมื่อจำเป็น
  const rows = await db
    .select({
      total: sql<number>`count(*)`,
      done: sql<number>`coalesce(sum(${todos.done}), 0)`,
    })
    .from(todos)
    .where(eq(todos.userId, userId));
  const total = Number(rows[0].total);
  const done = Number(rows[0].done);
  return { total, done, pending: total - done };
}

export async function todoExists(userId: string, text: string): Promise<boolean> {
  await ready;
  const rows = await db
    .select({ id: todos.id })
    .from(todos)
    .where(and(eq(todos.text, text), eq(todos.userId, userId)));
  return rows.length > 0;
}

export async function insertTodo(userId: string, text: string): Promise<void> {
  await ready;
  // .values({...}) type-safe — ใส่ field ผิดชื่อ/ผิด type ฟ้องทันที
  await db.insert(todos).values({ text, userId, done: false });
}

export async function toggleTodoDone(userId: string, id: number): Promise<void> {
  await ready;
  await db
    .update(todos)
    .set({ done: sql`NOT ${todos.done}` }) // สลับ 0↔1 ด้วย sql``
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}

export async function updateTodoText(
  userId: string,
  id: number,
  text: string
): Promise<void> {
  await ready;
  await db
    .update(todos)
    .set({ text })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}

export async function deleteTodoById(userId: string, id: number): Promise<void> {
  await ready;
  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}
