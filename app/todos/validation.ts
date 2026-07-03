// 🧪 logic บริสุทธิ์ (pure function): รับ text → คืน error หรือ null
//    ไม่ยุ่ง database/auth/network เลย → test ง่ายมาก (input เดิม = output เดิมเสมอ)

export function validateTodoText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "กรุณาพิมพ์ชื่องาน";
  if (trimmed.length > 100) return "ยาวเกินไป (ห้ามเกิน 100 ตัวอักษร)";
  return null; // ผ่าน
}
