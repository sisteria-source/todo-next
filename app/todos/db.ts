// 🗄️ เชื่อม Turso + query ด้วย Drizzle ORM (type-safe)
//    schema/ตาราง จัดการผ่าน drizzle-kit แล้ว (npm run db:push) — ไม่ต้อง CREATE TABLE เอง

import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { and, eq, sql } from "drizzle-orm";
import { todos } from "./schema";

export type Todo = { id: number; text: string; done: boolean };

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const db = drizzle(client);

// ───────── query ด้วย Drizzle (พิมพ์ชื่อคอลัมน์ผิด = ฟ้องทันที + autocomplete) ─────────

export async function getTodos(userId: string): Promise<Todo[]> {
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
  const rows = await db
    .select({ id: todos.id, text: todos.text, done: todos.done })
    .from(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
  return rows[0];
}

export async function getStats(userId: string): Promise<{
  total: number;
  done: number;
  pending: number;
}> {
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
  const rows = await db
    .select({ id: todos.id })
    .from(todos)
    .where(and(eq(todos.text, text), eq(todos.userId, userId)));
  return rows.length > 0;
}

export async function insertTodo(userId: string, text: string): Promise<void> {
  await db.insert(todos).values({ text, userId, done: false });
}

export async function toggleTodoDone(userId: string, id: number): Promise<void> {
  await db
    .update(todos)
    .set({ done: sql`NOT ${todos.done}` })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}

export async function updateTodoText(
  userId: string,
  id: number,
  text: string
): Promise<void> {
  await db
    .update(todos)
    .set({ text })
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}

export async function deleteTodoById(userId: string, id: number): Promise<void> {
  await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)));
}
