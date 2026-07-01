import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ย้ายจาก better-sqlite3 → @libsql/client (pure JS) แล้ว ไม่ต้องตั้ง serverExternalPackages
};

export default nextConfig;
