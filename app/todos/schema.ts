// 📐 นิยาม "ตาราง" เป็นโค้ด — Drizzle เอาไปสร้าง type + ตรวจ query ให้อัตโนมัติ
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  text: text("text").notNull(),
  // mode: "boolean" → Drizzle แปลง 0/1 ใน SQLite ↔ true/false ใน JS ให้เอง! (ไม่ต้องแปลงมือ)
  done: integer("done", { mode: "boolean" }).notNull().default(false),
  userId: text("user_id"), // ชื่อ property (userId) ต่างจากชื่อคอลัมน์ (user_id) ได้
});
