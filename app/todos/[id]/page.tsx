// 📁 app/todos/[id]/page.tsx
//    โฟลเดอร์ชื่อ [id] (วงเล็บเหลี่ยม) = dynamic segment
//    → จับคู่กับ /todos/1, /todos/2, /todos/อะไรก็ได้
//    [id] ใน Next.js = :id ใน React Router ที่เรียนมาบทที่ 15

import Link from "next/link";
import { notFound } from "next/navigation";
import { getTodoById } from "../db";

// ⚠️ จุดที่ต่างจาก useParams เดิม:
//    1. params ส่งเข้ามาทาง "props" (ไม่ใช่ hook) เพราะนี่คือ Server Component
//    2. ใน Next.js เวอร์ชันใหม่ params เป็น Promise → ต้อง async + await
//    3. ค่าที่ได้เป็น string เสมอ (เหมือนเดิม) → ต้อง Number() ก่อนเทียบ id
export default async function TodoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // คลายห่อ Promise เอาค่า id ออกมา

  // ดึง todo ตัวเดียวจาก database (Number(id) เพราะ id จาก URL เป็น string)
  const todo = getTodoById(Number(id));

  // ไม่เจอ → เด้งไปหน้า 404 ของ Next.js อัตโนมัติ (แทน <Route path="*"> เดิม)
  if (!todo) {
    notFound();
  }

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {todo.done ? "✅" : "⬜"} {todo.text}
      </h1>

      <p className="text-zinc-600 dark:text-zinc-400">
        สถานะ: {todo.done ? "เสร็จแล้ว" : "ยังไม่เสร็จ"} (id: {todo.id})
      </p>

      <Link href="/todos" className="text-sm text-blue-500 hover:underline">
        ← กลับไปรายการงาน
      </Link>
    </main>
  );
}