// 📁 app/todos/page.tsx → route "/todos"
//    กลับมาเป็น Server Component ล้วน! ไม่มี "use client", ไม่มี useState, ไม่มี localStorage
//    การโต้ตอบทั้งหมด (เพิ่ม/ติ๊ก/ลบ) ทำผ่าน <form action={serverAction}>

import Link from "next/link";
import { getTodos } from "./db";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";

// บอก Next.js ว่าหน้านี้ต้อง render สดทุก request (ห้ามแช่แข็งเป็น static ตอน build)
// เพราะข้อมูล todos เปลี่ยนตลอด → ต้องอ่าน database สดเสมอ
export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todos = await getTodos(); // อ่านจาก database ตอน render (บน server)

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        📋 รายการงาน
      </h1>

      {/* ฟอร์มเพิ่มงาน (แยกเป็น Client Component เพราะใช้ useActionState โชว์ error) */}
      <AddTodoForm />

      <ul className="flex flex-col gap-2">
        {/* แต่ละแถวเป็น Client Component (มีโหมดแก้ไข) — ส่ง todo ลงไปเป็น prop */}
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </ul>

      <Link href="/" className="text-sm text-blue-500 hover:underline">
        ← กลับหน้าแรก
      </Link>
    </main>
  );
}
