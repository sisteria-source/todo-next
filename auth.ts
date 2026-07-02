// ⚙️ ตั้งค่ากลางของ Auth.js (NextAuth v5)

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub],

  callbacks: {
    // ตอน login ครั้งแรกของ session, profile = ข้อมูลจาก GitHub (มี id ที่ "คงที่ตลอด")
    // เก็บลง token.uid → อยู่ใน cookie ข้าม session โดยไม่เปลี่ยน
    // (ห้ามใช้ token.sub เพราะ Auth.js สุ่มใหม่ทุก login ตอนไม่มี database adapter)
    jwt({ token, profile }) {
      if (profile) {
        token.uid = String((profile as { id?: number | string }).id ?? token.sub);
      }
      return token;
    },

    // เอา GitHub id (token.uid) ที่คงที่ใส่ลง session.user.id → ใช้แยกงานแต่ละคน
    session({ session, token }) {
      if (session.user && token.uid) {
        session.user.id = String(token.uid);
      }
      return session;
    },
  },
});
