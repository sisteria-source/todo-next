// route.ts (ไม่ใช่ page.tsx) = API endpoint ไม่ใช่หน้าเว็บ
// เอา handlers จาก auth.ts มา export เป็น GET/POST → Auth.js จัดการ login/logout/callback ให้
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
