import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // test เป็น logic ฝั่ง server → ใช้ node (ไม่ต้องจำลอง browser)
    include: ["**/*.test.ts"], // ไฟล์ที่ลงท้าย .test.ts เท่านั้น
  },
});
