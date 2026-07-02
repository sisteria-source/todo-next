import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import "./globals.css";

// รันฟังก์ชันบน Vercel ที่ภูมิภาค "โตเกียว" (hnd1) ให้ตรงกับ Turso (ap-northeast-1)
// → server กับ database อยู่ใกล้กัน query เร็วขึ้นมาก (ลด latency ข้ามทวีป)
export const preferredRegion = "hnd1";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Todo App (Next.js)",
  description: "Fullstack todo app — Next.js + Turso + Auth.js",
};

// async เพราะต้อง await auth() เพื่อเช็คว่า login อยู่ไหม
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth(); // อ่าน session ปัจจุบัน (null ถ้ายังไม่ login)

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* แถบบนสุด — โชว์สถานะ login + ปุ่ม */}
        <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <Link href="/" className="font-semibold text-zinc-900 dark:text-zinc-50">
            📝 Todo
          </Link>

          {session?.user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                {session.user.name}
              </span>
              {/* ปุ่ม logout — เรียก signOut ผ่าน server action */}
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="rounded-lg border border-zinc-300 px-3 py-1 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800">
                  ออกจากระบบ
                </button>
              </form>
            </div>
          ) : (
            // ปุ่ม login — เรียก signIn("github") ผ่าน server action
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button className="rounded-lg bg-zinc-900 px-3 py-1 text-sm text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900">
                เข้าสู่ระบบด้วย GitHub
              </button>
            </form>
          )}
        </header>

        {children}
      </body>
    </html>
  );
}
