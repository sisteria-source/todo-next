# 🔐 สรุประบบ Authentication (Auth.js v5 + GitHub)

แต่ละไฟล์ทำอะไร + flow การทำงาน + จุดพลาดที่ต้องระวัง

---

## 🗂️ ไฟล์ไหนทำอะไร

| ไฟล์ | หน้าที่ |
|------|---------|
| **`auth.ts`** (root) | ⚙️ ตั้งค่ากลางของ Auth.js — เลือก provider (GitHub) + callbacks. export `handlers`, `signIn`, `signOut`, `auth` ออกไปให้ที่อื่นใช้ |
| **`next-auth.d.ts`** (root) | 🏷️ บอก TypeScript ว่า `session.user` มี `id` และ token มี `uid` (ปกติไม่มี) |
| **`app/api/auth/[...nextauth]/route.ts`** | 🚪 API endpoint จับทุก path ใต้ `/api/auth/*` (login, logout, callback จาก GitHub) — เอา `handlers` มา export เป็น GET/POST |
| **`app/layout.tsx`** | 🎛️ แถบบน (header) — เรียก `auth()` เช็ค login แล้วโชว์ปุ่ม "เข้าสู่ระบบ" หรือ "ออกจากระบบ" (เรียก `signIn`/`signOut` ผ่าน server action) |
| **`app/todos/actions.ts`** | ✍️ ทุก Server Action เรียก `getUserId()` (จาก `auth()`) เช็คว่า login → ส่ง `userId` ต่อให้ db |
| **`app/todos/db.ts`** | 🗄️ ทุก query มี `WHERE user_id = ?` — แต่ละคนเห็น/แก้/ลบเฉพาะงานตัวเอง |
| **`app/page.tsx`, `todos/page.tsx`, `todos/[id]/page.tsx`** | 🛡️ guard `if (!session?.user?.id)` → ไม่ login เด้งหน้า login/404 |
| **`.env.local`** | 🔑 เก็บความลับ: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET` (ไม่ขึ้น git) |

---

## 🔄 Flow ตอน login

```
1. กดปุ่ม "เข้าสู่ระบบ" (layout.tsx)
      → signIn("github") [server action]
2. เด้งไป GitHub ให้ user อนุญาต
3. GitHub ส่งกลับมาที่ /api/auth/callback/github  (route.ts จัดการ)
4. Auth.js รัน callback:
      jwt()     → เก็บ GitHub id (profile.id) ลง token.uid
      session() → เอา token.uid ใส่ session.user.id
5. เก็บ session ลง cookie (เข้ารหัสด้วย AUTH_SECRET)
6. หน้าเว็บเรียก auth() อ่าน session ได้ → รู้ว่าใคร login อยู่
```

## 🔄 Flow ตอนใช้งาน (เช่น เพิ่มงาน)

```
<form action={addTodo}>  (AddTodoForm)
   → addTodo() [actions.ts]
       → getUserId() → auth() → session.user.id
       → ถ้าไม่มี → return (กันคนไม่ login)
       → insertTodo(userId, text)  [db.ts: INSERT ... user_id = ?]
   → revalidatePath("/todos")
```

---

## 🔑 env ที่ต้องมี (`.env.local`)

```
AUTH_SECRET=...          # กุญแจเข้ารหัส session cookie (ชื่อต้องเป๊ะ!)
AUTH_GITHUB_ID=...       # Client ID จาก GitHub OAuth App
AUTH_GITHUB_SECRET=...   # Client Secret จาก GitHub OAuth App
```
- GitHub OAuth App: callback URL ต้องเป็น `http://localhost:3000/api/auth/callback/github`
- Auth.js v5 มองหาชื่อ `AUTH_<PROVIDER>_ID/SECRET` อัตโนมัติ

---

## ⚠️ จุดพลาดที่เจอมาแล้ว (ห้ามลืม)

1. **ชื่อ env ผิด** — ตั้งเป็น `BETTER_AUTH_SECRET` → Auth.js หาไม่เจอ (`MissingSecret`). ต้องเป็น `AUTH_SECRET` เป๊ะ
2. **ข้อมูลหายตอน re-login** — เคยใช้ `token.sub` เป็น user id แต่ Auth.js (ไม่มี DB adapter) **สุ่ม token.sub ใหม่ทุก login** → id ไม่คงที่. แก้โดยดึง `profile.id` (GitHub id จริง คงที่) เก็บใน `token.uid`
3. **guard ต้องเช็ค `session?.user?.id`** ไม่ใช่แค่ `session?.user` — ไม่งั้น session เก่าที่ไม่มี id จะหลุดไป query จน crash ("Unsupported type of value")
4. **แก้ auth แล้วต้อง logout+login ใหม่** — เพราะ token สร้างตอน login เท่านั้น cookie เดิมไม่มีค่าใหม่

---

## 🔒 หลักความปลอดภัยสำคัญ
- เช็คสิทธิ์ที่ **server (query `WHERE user_id = ?`)** เสมอ — โดยเฉพาะ UPDATE/DELETE
  (คนอื่นเดา id แล้วยิง request ตรงมาได้ → ซ่อนปุ่มใน UI อย่างเดียวไม่พอ)
- ความลับอยู่ใน `.env.local` (local) + Vercel Environment Variables (production) — ไม่ hard-code, ไม่ขึ้น git

---

## 🚀 ตอน deploy ขึ้น Vercel (ยังไม่ได้ทำ)
1. เพิ่ม env 3 ตัวใน Vercel: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
2. สร้าง GitHub OAuth App อีกอันสำหรับ production (callback = `https://<app>.vercel.app/api/auth/callback/github`)
   — เพราะ OAuth App 1 อันใส่ callback ได้ URL เดียว
