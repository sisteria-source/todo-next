"use server"; // 👈 ทุกฟังก์ชันในไฟล์นี้ = Server Action (รันบน server เท่านั้น)
//    ปลอดภัย: โค้ดในนี้ไม่ถูกส่งไป browser → ต่อ database/ใส่ความลับได้

import { revalidatePath } from "next/cache";
import {
  getTodos,
  insertTodo,
  toggleTodoDone,
  deleteTodoById,
  updateTodoText,
} from "./db";

// สถานะที่ addTodo ส่งกลับให้ฟอร์ม — ไว้แสดง error (null = ไม่มี error)
export type AddState = { error: string | null };

// เพิ่มงานใหม่ + ตรวจข้อมูล
// ⚠️ พอใช้กับ useActionState → signature เปลี่ยน: รับ (prevState, formData)
//    และต้อง "return state ใหม่" กลับไปเสมอ (ไม่ใช่ return เปล่าๆ)
export async function addTodo(
  _prevState: AddState,
  formData: FormData
): Promise<AddState> {
  const text = String(formData.get("text") ?? "").trim();

  // ── กฎ validation (ตรวจที่ server → กันข้อมูลมั่วได้จริง) ──
  if (!text) return { error: "กรุณาพิมพ์ชื่องาน" };
  if (text.length > 100) return { error: "ยาวเกินไป (ห้ามเกิน 100 ตัวอักษร)" };
  if (getTodos().some((t) => t.text === text)) {
    return { error: "มีงานนี้อยู่แล้ว" };
  }

  insertTodo(text);
  revalidatePath("/todos");
  return { error: null }; // สำเร็จ → ไม่มี error
}

// สลับสถานะติ๊ก
export async function toggleTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  toggleTodoDone(id);
  revalidatePath("/todos");
}

// ลบงาน
export async function deleteTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteTodoById(id);
  revalidatePath("/todos");
}

// แก้ข้อความงาน
export async function updateTodo(formData: FormData) {
  const id = Number(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return; // ว่าง → ไม่บันทึก (validation ฝั่ง server)

  updateTodoText(id, text);
  revalidatePath("/todos");
}
