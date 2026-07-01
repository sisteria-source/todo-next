"use client"; // มี useState (จำโหมดแก้) → Client Component

import { useState } from "react";
import Link from "next/link";
import type { Todo } from "./db";
import { toggleTodo, deleteTodo, updateTodo } from "./actions";

export default function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false);

  // ───── โหมดแก้ไข ─────
  if (isEditing) {
    // action เป็น "ฟังก์ชัน client" ที่เรียก Server Action ก่อน แล้วค่อยปิดโหมดแก้
    //   → ได้ทั้งบันทึกลง db (server) + อัปเดต UI (client) ในจังหวะเดียว
    async function handleSave(formData: FormData) {
      await updateTodo(formData); // บันทึกบน server
      setIsEditing(false); // ปิดโหมดแก้ (ฝั่ง client)
    }

    return (
      <li className="flex items-center gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
        <form action={handleSave} className="flex flex-1 gap-2">
          <input type="hidden" name="id" value={todo.id} />
          {/* defaultValue (ไม่ใช่ value) → input แบบ uncontrolled พิมพ์แก้ได้อิสระ */}
          <input
            name="text"
            defaultValue={todo.text}
            autoFocus
            className="flex-1 rounded border border-zinc-300 px-2 py-1 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <button className="text-sm text-green-600 hover:underline">
            บันทึก
          </button>
        </form>
        <button
          onClick={() => setIsEditing(false)}
          className="text-sm text-zinc-500 hover:underline"
        >
          ยกเลิก
        </button>
      </li>
    );
  }

  // ───── โหมดปกติ (ดู) ─────
  return (
    <li className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      {/* ปุ่มติ๊ก */}
      <form action={toggleTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button className="text-xl" aria-label="สลับสถานะงาน">
          {todo.done ? "✅" : "⬜"}
        </button>
      </form>

      <Link
        href={`/todos/${todo.id}`}
        className={`flex-1 hover:underline ${
          todo.done ? "text-zinc-400 line-through" : ""
        }`}
      >
        {todo.text}
      </Link>

      {/* ปุ่มแก้ — แค่สลับ state ฝั่ง client (ยังไม่ยุ่งกับ server) */}
      <button
        onClick={() => setIsEditing(true)}
        className="text-sm hover:opacity-70"
        aria-label="แก้ไขงาน"
      >
        ✏️
      </button>

      {/* ปุ่มลบ */}
      <form action={deleteTodo}>
        <input type="hidden" name="id" value={todo.id} />
        <button
          className="text-sm text-red-500 hover:text-red-700"
          aria-label="ลบงาน"
        >
          🗑️
        </button>
      </form>
    </li>
  );
}
