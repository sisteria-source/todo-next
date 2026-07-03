// ⚙️ ตั้งค่าให้เครื่องมือ drizzle-kit (ใช้ตอนสั่ง push/generate ใน terminal)
import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit รันนอก Next.js → ต้องโหลด .env.local เอง (Next โหลดให้เฉพาะตอนรันแอป)
config({ path: ".env.local" });

export default defineConfig({
  dialect: "turso", // Turso = libSQL
  schema: "./app/todos/schema.ts", // ไฟล์นิยามตาราง
  out: "./drizzle", // โฟลเดอร์เก็บไฟล์ migration ที่ generate
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
