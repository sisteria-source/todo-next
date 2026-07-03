import { describe, it, expect } from "vitest";
import { validateTodoText } from "./validation";

// describe = จัดกลุ่ม test / it = 1 เคส / expect(...).toXxx(...) = สิ่งที่คาดหวัง
describe("validateTodoText", () => {
  it("ข้อความว่าง → error", () => {
    expect(validateTodoText("")).toBe("กรุณาพิมพ์ชื่องาน");
  });

  it("มีแต่ช่องว่าง → error (เพราะ trim แล้วว่าง)", () => {
    expect(validateTodoText("    ")).toBe("กรุณาพิมพ์ชื่องาน");
  });

  it("ยาวเกิน 100 ตัว → error", () => {
    expect(validateTodoText("a".repeat(101))).toContain("ยาวเกินไป");
  });

  it("100 ตัวพอดี → ผ่าน (null)", () => {
    expect(validateTodoText("a".repeat(100))).toBeNull();
  });

  it("ข้อความปกติ → ผ่าน (null)", () => {
    expect(validateTodoText("ซื้อนม")).toBeNull();
  });

  it("ข้อความมีช่องว่างหน้า-หลัง แต่เนื้อหาโอเค → ผ่าน", () => {
    expect(validateTodoText("  ทำการบ้าน  ")).toBeNull();
  });
});
