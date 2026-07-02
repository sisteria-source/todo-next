"use server"; // 👈 ทุกฟังก์ชันในไฟล์นี้ = Server Action (รันบน server เท่านั้น)

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  todoExists,
  insertTodo,
  toggleTodoDone,
  deleteTodoById,
  updateTodoText,
} from "./db";

// helper: ดึง userId จาก session (null ถ้ายังไม่ login)
async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export type AddState = { error: string | null };

// เพิ่มงานใหม่ + ตรวจข้อมูล + ผูกกับ user ที่ login
export async function addTodo(
  _prevState: AddState,
  formData: FormData
): Promise<AddState> {
  const userId = await getUserId();
  if (!userId) return { error: "กรุณาเข้าสู่ระบบก่อน" }; // กันคนไม่ login

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return { error: "กรุณาพิมพ์ชื่องาน" };
  if (text.length > 100) return { error: "ยาวเกินไป (ห้ามเกิน 100 ตัวอักษร)" };
  if (await todoExists(userId, text)) {
    return { error: "มีงานนี้อยู่แล้ว" };
  }

  await insertTodo(userId, text);
  revalidatePath("/todos");
  return { error: null };
}

export async function toggleTodo(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return; // ไม่ login → ไม่ทำอะไร

  await toggleTodoDone(userId, Number(formData.get("id")));
  revalidatePath("/todos");
}

export async function deleteTodo(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return;

  await deleteTodoById(userId, Number(formData.get("id")));
  revalidatePath("/todos");
}

export async function updateTodo(formData: FormData) {
  const userId = await getUserId();
  if (!userId) return;

  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  await updateTodoText(userId, Number(formData.get("id")), text);
  revalidatePath("/todos");
}
