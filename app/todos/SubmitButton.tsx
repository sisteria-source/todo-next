"use client"; // ใช้ hook → ต้องเป็น Client Component

import { useFormStatus } from "react-dom"; // ⚠️ มาจาก "react-dom" ไม่ใช่ "react"

// useFormStatus = ดูสถานะของ <form> "ตัวที่ครอบ component นี้อยู่"
// ⚠️ กฎสำคัญ: ต้องเป็น component "ลูก" ที่อยู่ "ข้างใน" <form>
//    จะใช้ในไฟล์เดียวกับที่เขียน <form> ไม่ได้ → เลยต้องแยกออกมาเป็นไฟล์นี้
export default function SubmitButton() {
  const { pending } = useFormStatus(); // pending = true ตอน Server Action กำลังทำงาน

  return (
    <button
      disabled={pending} // กำลังส่ง → ปิดปุ่ม กันกดซ้ำ
      className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
    >
      {pending ? "กำลังบันทึก..." : "เพิ่ม"}
    </button>
  );
}
