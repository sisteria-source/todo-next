// 📁 app/todos/page.tsx → route "/todos" (+ ?filter=active/done)
//    Server Component — อ่าน filter จาก URL แล้วกรอง todos ก่อนแสดง

import Link from "next/link";
import { auth } from "@/auth";
import { getTodos } from "./db";
import AddTodoForm from "./AddTodoForm";
import TodoItem from "./TodoItem";

export const dynamic = "force-dynamic";

// แถบ filter — key ต้องตรงกับค่าใน URL, href คือลิงก์ที่เปลี่ยน ?filter=
const FILTERS = [
  { key: "all", label: "ทั้งหมด", href: "/todos" },
  { key: "active", label: "ค้างอยู่", href: "/todos?filter=active" },
  { key: "done", label: "เสร็จแล้ว", href: "/todos?filter=done" },
] as const;

export default async function TodosPage({
  searchParams,
}: {
  // ⚠️ searchParams เป็น Promise เหมือน params (Next.js เวอร์ชันใหม่) → ต้อง await
  searchParams: Promise<{ filter?: string }>;
}) {
  // เช็ค login ก่อน — ต้องมีทั้ง user "และ" id (กัน session เก่าที่ยังไม่มี id)
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          🔒 กรุณาเข้าสู่ระบบ (ปุ่มมุมขวาบน) เพื่อดูงานของคุณ
        </p>
      </main>
    );
  }
  const userId = session.user.id;

  const { filter } = await searchParams;
  // กันค่าแปลกปลอมจาก URL → ยอมรับแค่ 3 ค่า ที่เหลือถือเป็น "all"
  const current = filter === "active" || filter === "done" ? filter : "all";

  const allTodos = await getTodos(userId);

  // กรองตาม filter (derived state — คำนวณสด ไม่เก็บซ้ำ เหมือน React บทที่ 11)
  const todos =
    current === "active"
      ? allTodos.filter((t) => !t.done)
      : current === "done"
      ? allTodos.filter((t) => t.done)
      : allTodos;

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        📋 รายการงาน
      </h1>

      <AddTodoForm />

      {/* แถบ filter — ไฮไลต์อันที่เลือกอยู่ (รู้ค่า current บน server เลย ไม่ต้อง client) */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={f.href}
            className={`rounded-full px-3 py-1 text-sm ${
              current === f.key
                ? "bg-blue-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {todos.length === 0 ? (
          <li className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
            ไม่มีงานในหมวดนี้
          </li>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </ul>

      <Link href="/" className="text-sm text-blue-500 hover:underline">
        ← กลับหน้าแรก
      </Link>
    </main>
  );
}
