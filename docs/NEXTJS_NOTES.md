# 🚀 สรุปคอร์ส Next.js (บท 33–48)

ต่อยอดจาก React + TypeScript (32 บทแรก) — สร้างแอป Todo fullstack จริง deploy ขึ้นเว็บ
เรียงตามบทที่เรียน — แต่ละบทมี "เรียนอะไร" + "จุดสำคัญ/โค้ด"

---

## 🧭 ภาพรวม: Next.js ต่างจาก React (Vite) ยังไง

| เรื่อง | React ปกติ (Vite) | Next.js |
|-------|-------------------|---------|
| Routing | เขียน `<Route>` เอง | **โฟลเดอร์ = path** (ไฟล์ `page.tsx`) |
| โค้ดรันที่ไหน | browser 100% | **server ก่อน** แล้วส่ง HTML มา |
| ดึงข้อมูล | `useEffect` + `fetch` | เรียก DB ตรงๆ ใน Server Component |
| เขียนข้อมูล | สร้าง API + fetch | **Server Actions** (`<form action={fn}>`) |
| Link | `react-router-dom` `to=` | `next/link` `href=` |

---

## บทที่ 33 — Next.js intro & Server Component
- ไฟล์ที่ไม่มี `"use client"` = **Server Component** (รันบน server, ส่ง HTML สำเร็จรูป)
- ใช้ `useState`/`onClick`/`useEffect` ไม่ได้ (ต้องเป็น Client Component)

## บทที่ 34 — File-based Routing
```
app/page.tsx        → /
app/todos/page.tsx  → /todos
```
- ชื่อไฟล์ต้องเป็น `page.tsx` เป๊ะๆ ถึงเป็นหน้าเว็บ
- `import Link from "next/link"` → `<Link href="/todos">`

## บทที่ 35 — Dynamic Route `[id]`
```tsx
// app/todos/[id]/page.tsx  → /todos/1, /todos/2
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;   // ⚠️ params เป็น Promise → ต้อง await
}
```
- `[id]` = `:id` ของ React Router / รับผ่าน **props** ไม่ใช่ `useParams`
- หา 404 → เรียก `notFound()` (แทน `<Route path="*">`)

## บทที่ 36 — Client Component `"use client"`
```tsx
"use client";   // บรรทัดบนสุด → ใช้ useState/onClick/useEffect ได้
```
- **Server ดึงข้อมูล → ส่ง props → Client จัดการโต้ตอบ**
- ใส่ `"use client"` เฉพาะไฟล์ที่ต้องโต้ตอบ (ยิ่ง Server มาก ยิ่งเร็ว)

## บทที่ 37 — localStorage + Hydration
- ห้ามอ่าน localStorage ตอน `useState` init → first render ต้องตรงกับ server (ไม่งั้น **hydration mismatch**)
- อ่านใน `useEffect` แทน (ทำงานบน browser หลัง render)
- กฎใหม่ React 19 `react-hooks/set-state-in-effect`: เซฟใน **event handler** ไม่ใช่ effect ("You Might Not Need an Effect")
- `eslint-disable-next-line <rule>` ต้องวาง **บรรทัดก่อนหน้าที่ผิดเป๊ะๆ**

## บทที่ 38 — Server Actions ⭐
```tsx
// actions.ts
"use server";                         // ทุกฟังก์ชัน = Server Action
export async function addTodo(formData: FormData) {
  const text = String(formData.get("text") ?? "");
  // ...เขียน DB...
  revalidatePath("/todos");           // สั่งวาดหน้าใหม่
}
// page.tsx
<form action={addTodo}>               // เรียก server ตรงๆ ไม่ต้อง fetch/API
```
- ไม่ต้องสร้าง API endpoint, ไม่ต้อง fetch, ไม่ต้อง useState
- ความลับ (token/password) อยู่ใน action ไม่ถูกส่งไป browser

## บทที่ 39 — SQLite Database จริง (better-sqlite3)
- `serverExternalPackages: ["better-sqlite3"]` ใน next.config (native module)
- SQL พื้นฐาน: `CREATE TABLE` / `SELECT` / `INSERT` / `UPDATE` / `DELETE`
- **`?` placeholder** กัน SQL injection (ห้ามต่อ string เอง!)
- SQLite ไม่มี boolean → เก็บ `done` เป็น 0/1

## บทที่ 40 — useFormStatus
```tsx
"use client";
const { pending } = useFormStatus();   // จาก "react-dom"
<button disabled={pending}>{pending ? "กำลังบันทึก..." : "เพิ่ม"}</button>
```
- ⚠️ ต้องเป็น component **ลูก** ที่อยู่ **ข้างใน** `<form>` (แยกเป็นไฟล์ต่างหาก)

## บทที่ 42 — Validation + useActionState
```tsx
const [state, formAction] = useActionState(addTodo, { error: null });
<form action={formAction}>
{state.error && <p>{state.error}</p>}
```
- action เปลี่ยน signature เป็น `(prevState, formData)` + ต้อง `return` state
- **validate ที่ server เสมอ** (client บายพาสได้ → ไม่ปลอดภัย)

## บทที่ 43 — Edit Mode + client action wrapper
```tsx
async function handleSave(formData: FormData) {
  await updateTodo(formData);   // server: บันทึก DB
  setIsEditing(false);          // client: ปิดโหมดแก้
}
```
- ห่อ Server Action ด้วยฟังก์ชัน client → ทำ server + client ในจังหวะเดียว
- ช่องแก้ใช้ `defaultValue` (uncontrolled) + `autoFocus`

## บทที่ 44 — Dashboard (Server Component อ่าน DB ตรง)
```tsx
export default async function Home() {
  const { total, done, pending } = await getStats();   // เรียก DB ตรงเลย
}
```
- ไม่ต้อง fetch/useEffect/loading state (server รอให้เสร็จก่อนส่ง)

## บทที่ 45 — Deploy Concepts
- `npm run build` = สิ่งที่ Vercel รัน (พังตรงนี้ = deploy ไม่ผ่าน)
- **○ Static vs ƒ Dynamic** → หน้าที่อ่านข้อมูลสดใส่ `export const dynamic = "force-dynamic"`
- **Serverless** (Vercel) = ปลุกโค้ดชั่วคราวแล้วดับ → **เขียนไฟล์ถาวรไม่ได้** → SQLite ไฟล์ใช้ไม่ได้
- SQLite ใช้ cloud ได้ถ้าเป็น server/VPS ที่มีดิสก์ถาวร (Railway/Render/Fly) — แต่ Vercel ต้องแยก DB ออกไป

## บทที่ 45.5 — ย้ายไป Turso (libSQL cloud)
```tsx
import { createClient } from "@libsql/client";
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
const rs = await client.execute({ sql: "... WHERE id = ?", args: [id] });
```
- Turso = SQLite เวอร์ชัน cloud → SQL เหมือนเดิม แต่ **ต่อผ่านเน็ต → ทุกฟังก์ชันเป็น async**
- credentials อยู่ใน `.env.local` (ไม่ขึ้น git) + ตั้งซ้ำใน Vercel Environment Variables
- `preferredRegion = "hnd1"` → รัน server ใกล้ DB (ลด latency ข้ามทวีป)

## บทที่ 46 — useOptimistic
```tsx
const [optimisticDone, setOptimisticDone] = useOptimistic(
  todo.done, (_cur, next: boolean) => next
);
async function handleToggle(formData: FormData) {
  setOptimisticDone(!optimisticDone);   // จอเปลี่ยนทันที
  await toggleTodo(formData);            // server ตามหลัง
}
```
- UI เปลี่ยนทันทีก่อน server ตอบ (รู้สึกไว) → พอ revalidate ค่าจริงกลับมายืนยัน
- server พลาด → เด้งกลับค่าเดิมเอง / เรียก setOptimistic ได้เฉพาะใน action

## บทที่ 47 — Filter ด้วย searchParams
```tsx
export default async function Page({ searchParams }: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;   // ⚠️ Promise → await
}
<Link href="/todos?filter=active">ค้างอยู่</Link>
```
- URL เก็บ filter → refresh/แชร์ลิงก์แล้วไม่หาย (ดีกว่า useState)
- ตรวจค่าเสมอ (ผู้ใช้พิมพ์ `?filter=มั่ว` ได้)

## บทที่ 48 — ลด query (ลด round trip)
```sql
-- getStats: 2 query → 1
SELECT COUNT(*) AS total, COALESCE(SUM(done),0) AS done FROM todos
-- เช็คซ้ำ: โหลดทุกแถว → ถามเฉพาะ
SELECT COUNT(*) AS n FROM todos WHERE text = ?
```
- **ให้ database คำนวณ/กรอง/นับ** แล้วส่งแค่ผลลัพธ์ อย่าดึงดิบมาทำใน JS

---

## 📦 โครงสร้างโปรเจกต์นี้
```
app/
  layout.tsx          → โครงร่วม + preferredRegion
  page.tsx            → หน้าแรก Dashboard (Server, อ่าน getStats)
  todos/
    page.tsx          → /todos list (Server, searchParams filter)
    [id]/page.tsx     → /todos/:id detail (Server, dynamic route)
    db.ts             → เชื่อม Turso + ฟังก์ชัน query (async)
    actions.ts        → Server Actions (add/toggle/delete/update)
    AddTodoForm.tsx   → Client (useActionState + validation)
    TodoItem.tsx      → Client (edit mode + useOptimistic)
    SubmitButton.tsx  → Client (useFormStatus)
.env.local            → TURSO_DATABASE_URL / TURSO_AUTH_TOKEN (ไม่ขึ้น git)
```

---

## 🧠 ประโยคทองจำไว้
- `"use client"` = รันใน browser / ไม่ใส่ = Server Component (รันบน server)
- `"use server"` = Server Action (รันบน server, เรียกจาก form ได้)
- `params` / `searchParams` = **Promise** → ต้อง `await`
- Server ดึงข้อมูล → props → Client โต้ตอบ
- validate + เก็บความลับ = ที่ **server** เสมอ
- Serverless เก็บไฟล์ถาวรไม่ได้ → database ต้องแยกไปบริการอื่น (Turso/Postgres)
- ให้ database ทำงานหนัก (SQL) แทนดึงดิบมาทำใน JS

---

## ✅ ทำได้แล้ว
- [x] แอป Todo fullstack: CRUD ครบ + Dashboard + Filter
- [x] Server Actions + cloud database (Turso)
- [x] Optimistic UI + validation + loading state
- [x] Deploy จริงบน Vercel (auto-deploy ตอน git push)

## 🎯 ก้าวต่อไป (ถ้าอยากไปต่อ)
- Authentication (login) — NextAuth / Clerk
- ORM แทน SQL ดิบ — Drizzle / Prisma
- Testing — Vitest + Playwright
- แยก todos ตาม user (แต่ละคนเห็นของตัวเอง)
