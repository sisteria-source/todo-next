// หน้าแรก = Dashboard สรุปงาน
// ยังเป็น Server Component (ไม่มี "use client") → เรียก getStats() อ่าน database ได้ตรงๆ
// ไม่ต้อง fetch, ไม่ต้อง useEffect, ไม่ต้อง useState เลย

import Link from "next/link";
import { getStats } from "./todos/db";

// หน้าแรกก็อ่าน database (สถิติ) → ต้องสดทุก request เช่นกัน
export const dynamic = "force-dynamic";

export default async function Home() {
  const { total, done, pending } = await getStats(); // อ่านสถิติจาก database บน server

  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          📝 Todo App (Next.js)
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">สรุปงานของคุณ</p>
      </div>

      {/* การ์ดสถิติ 3 ใบ — วน map จาก array เพื่อไม่เขียนซ้ำ */}
      <div className="grid w-full grid-cols-3 gap-3">
        {[
          { label: "ทั้งหมด", value: total, color: "text-zinc-900 dark:text-zinc-50" },
          { label: "เสร็จแล้ว", value: done, color: "text-green-600" },
          { label: "ค้างอยู่", value: pending, color: "text-orange-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-xs text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <Link
        href="/todos"
        className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
      >
        จัดการรายการงาน →
      </Link>
    </main>
  );
}
