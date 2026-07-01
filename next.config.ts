import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // บอก Next.js ว่า better-sqlite3 เป็น native module → อย่า bundle ให้ใช้ตรงๆ บน server
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
