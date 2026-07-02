// เพิ่ม field "id" เข้าไปใน type ของ session.user (ปกติมีแค่ name/email/image)
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// เพิ่ม field "uid" (GitHub id คงที่) เข้าไปใน token ที่เก็บใน cookie
declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
  }
}
