# 📚 สรุปการเรียน React + TypeScript

บันทึกสรุปจากการเรียนทั้งหมด ใช้เปิดทบทวนตอนลืม — เรียงตามลำดับที่เรียน

---

## 🧩 1. Component & JSX

```tsx
// Component = ฟังก์ชันที่ return JSX (ชื่อขึ้นต้นตัวใหญ่)
function Hello() {
  return <h1>สวัสดี</h1>;
}
```
- JSX: ใช้ `{}` แทรกค่า JS, ใช้ `className` แทน `class`, ปิดแท็กให้ครบ `<img />`

## ⚡ 2. State & Events (`useState`)

```tsx
const [count, setCount] = useState(0);   // [ค่า, ฟังก์ชันเปลี่ยนค่า]
<button onClick={() => setCount(count + 1)}>{count}</button>
```
- เปลี่ยน state ต้องผ่าน `setXxx` เสมอ (ห้ามแก้ตัวแปรตรงๆ) → React ถึงจะวาดใหม่
- Controlled input: `<input value={text} onChange={(e) => setText(e.target.value)} />`

## 🧬 3. Props (ส่งข้อมูลข้าม component)

```tsx
type GreetingProps = { name: string };
function Greeting({ name }: GreetingProps) {
  return <p>{name}</p>;
}
<Greeting name="ปุ้ย" />
```
- ส่ง "ฟังก์ชัน" เป็น props ได้ด้วย → ลูกเรียกกลับหาแม่ (callback): `onDelete: () => void`
- หลักการ: **ข้อมูลไหลลง (props), เหตุการณ์ไหลขึ้น (callbacks)**

## 📂 4. แยกไฟล์ (import / export)

```tsx
export function Greeting() {...}          // named export
import { Greeting } from "./Greeting";    // import (มีปีกกา)
export default App;                        // default export
import App from "./App";                   // import (ไม่มีปีกกา)
```

## 🔁 5. แสดงลิสต์ (`.map()` + key)

```tsx
{items.map((item) => (
  <li key={item.id}>{item.text}</li>   // ต้องมี key เสมอ! ใช้ id ไม่ใช่ index
))}
```

## 🔄 6. อัปเดต array/object แบบ immutable

```tsx
setTodos([...todos, newItem]);                          // เพิ่ม
setTodos(todos.filter((t) => t.id !== id));             // ลบ
setTodos(todos.map((t) => t.id === id ? {...t, done: !t.done} : t)); // แก้
```
- กฎ: **สร้างใหม่เสมอ** ห้ามแก้ของเดิม (`push`, แก้ field ตรงๆ)

## 🪝 7. useEffect (side effects)

```tsx
useEffect(() => {
  // fetch, บันทึก, timer
}, [deps]);   // [] = ครั้งเดียวตอนเปิด, [x] = เมื่อ x เปลี่ยน, ไม่ใส่ = ทุก render
```

## 💾 8. localStorage

```tsx
localStorage.setItem("key", JSON.stringify(data));      // เก็บ (object→string)
const d = JSON.parse(localStorage.getItem("key") ?? "[]"); // โหลด (string→object)
```
- Lazy init: `useState(() => { ...อ่าน localStorage... })` → อ่านครั้งเดียว

## 🗺️ 9. React Router

```tsx
<BrowserRouter>
  <NavLink to="/x">เมนู</NavLink>                  // ลิงก์ + รู้หน้าปัจจุบัน (isActive)
  <Routes>
    <Route path="/todos/:id" element={<Detail />} /> // :id = ตัวแปร
    <Route path="*" element={<NotFound />} />         // 404 (วางท้ายสุด)
  </Routes>
</BrowserRouter>

const { id } = useParams();   // ดึงตัวแปรจาก URL (เป็น string เสมอ → Number(id))
```

## 🌐 10. Fetch API + async/await

```tsx
useEffect(() => {
  async function load() {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("ผิดพลาด");
      setData(await res.json());
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```
- จัดการ 3 สถานะเสมอ: **loading / error / success**

## 🎓 11. Custom Hook

```tsx
function useFetch<T>(url: string) {   // ชื่อขึ้นต้น use, ใช้ Hook อื่นข้างในได้
  // useState + useEffect...
  return { data, loading, error };
}
```
- แยก logic ที่ใช้ซ้ำออกมา → เรียกใช้ได้ทุกที่

## 🌍 12. Context API (แชร์ state ทั้งแอป)

```tsx
const TodoContext = createContext<TodoContextType | null>(null);

export function TodoProvider({ children }) {
  // ถือ state จริง + ฟังก์ชัน
  return <TodoContext.Provider value={{...}}>{children}</TodoContext.Provider>;
}

export function useTodos() {           // custom hook คู่กับ context
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("ต้องอยู่ใน Provider");
  return ctx;
}
```
- แก้ปัญหา prop drilling — component ไหนก็หยิบจากตู้กลางได้
- ใช้เมื่อ "หลายที่ต้องแชร์กัน" เท่านั้น (ของใช้ที่เดียว → useState พอ)

## 🔧 13. Hooks อื่นๆ

| Hook | ใช้ทำอะไร |
|------|-----------|
| `useRef` | อ้างอิง DOM (เช่น `inputRef.current?.focus()`) / เก็บค่าที่ไม่ต้อง re-render |
| `useMemo` | จำ**ค่า**ที่คำนวณแล้ว — `useMemo(() => calc, [deps])` |
| `useCallback` | จำ**ฟังก์ชัน** — `useCallback(() => {...}, [deps])` |

- ⚠️ useMemo/useCallback อย่าใช้พร่ำเพรื่อ — ใช้เมื่อมีปัญหา performance จริง

---

# 🛠️ เครื่องมือมือโปร (Libraries)

## 🎨 Tailwind CSS
```tsx
<div className="max-w-md mx-auto p-6 bg-gray-900 rounded-xl text-white">
```
- utility class สำเร็จรูป: `p-4`(padding), `flex gap-2`, `text-xl`, `bg-gray-800`
- prefix สถานะ: `hover:bg-gray-700`, `focus:border-indigo-500`
- dynamic class: `` className={`base ${active ? "bg-indigo-500" : "bg-gray-800"}`} ``

## 📋 React Hook Form + Zod
```tsx
const schema = z.object({
  name: z.string().min(2, "อย่างน้อย 2 ตัว"),
  age: z.coerce.number().min(18, "ต้อง 18+"),
});
type FormInput = z.input<typeof schema>;    // ก่อน validate
type FormData  = z.output<typeof schema>;   // หลัง validate (coerce แปลงแล้ว)

const { register, handleSubmit, formState: { errors } } =
  useForm<FormInput, unknown, FormData>({ resolver: zodResolver(schema) });

<input {...register("name")} />
{errors.name && <p>{errors.name.message}</p>}
```
- ⚠️ ใช้ `coerce` → input type ≠ output type → ต้องแยก `z.input` / `z.output`

## ⚡ TanStack Query
```tsx
// อ่าน (GET) — มี cache อัตโนมัติ
const { data, isLoading, error } = useQuery({
  queryKey: ["posts"],
  queryFn: async () => (await fetch(url)).json(),
});

// เขียน (POST/PUT/DELETE)
const m = useMutation({
  mutationFn: async (x) => fetch(url, { method: "POST", body: JSON.stringify(x) }),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }), // รีเฟรช
});
m.mutate(value);   // สั่งทำงาน
```
- ต้องครอบแอปด้วย `<QueryClientProvider>` ก่อน
- ดีกว่า useFetch เอง: มี cache, refetch อัตโนมัติ, retry

---

# 🐛 การ Debug

1. **อ่าน error ใน Console ก่อน** (บอกตรงๆ ว่าอะไรผิด ที่ไฟล์ไหน บรรทัดไหน)
2. `console.log("label:", value)` / `console.table(arr)` — ดูค่าตัวแปร
3. **React DevTools** (extension) แท็บ Components — ดู state/props real-time
4. **Network tab** (F12) — ดู status code (200/404/500) + response ของ API
5. `debugger;` ในโค้ด — หยุดดูทีละบรรทัด

| Error บ่อยๆ | สาเหตุ |
|------------|--------|
| `Cannot read properties of undefined` | เข้าถึง `.x` ของ undefined → ใช้ `?.` |
| `unique "key" prop` | ลืม `key` ใน `.map()` |
| `Too many re-renders` | setState ใน render ตรงๆ |
| `useX must be used within Provider` | ลืมครอบ Provider |

---

# 🚀 Git & Deploy

## Git (อัปเดตโค้ดขึ้น GitHub)
```bash
git add -A
git commit -m "อธิบายว่าแก้อะไร"
git push
```
- หลายบัญชี: ใส่ชื่อใน URL → `https://USERNAME@github.com/USERNAME/repo.git`
- `.gitignore` กัน `node_modules`/`dist` ไม่ให้ขึ้น

## Build
```bash
npm run build    # tsc ตรวจ type + แปลงเป็นไฟล์ production ใน dist/
```

## Deploy (Vercel)
- เชื่อม GitHub repo → Vercel detect Vite → Deploy
- push ครั้งต่อไป → deploy ใหม่อัตโนมัติ (auto-deploy)
- SPA routing: ใส่ `vercel.json` (rewrites ทุก path → index.html) กัน refresh แล้ว 404
- แก้โค้ดในเครื่อง **ไม่กระทบ** เว็บที่ deploy แล้ว — เปลี่ยนเฉพาะตอน push สำเร็จ
- แก้ใหญ่ → ใช้ branch แยก (`git checkout -b dev`) → Vercel ทำ preview ลิงก์แยก

---

# 🛡️ TypeScript ที่ใช้บ่อย

```tsx
type Todo = { id: number; text: string; done: boolean };  // model
useState<Todo[]>([])                  // generic
"all" | "active" | "done"             // union type
onToggle: () => void                  // function type
import type { Todo } from "./types";  // import เฉพาะ type
["all","active","done"] as const      // ตรึงค่าเป็น literal
```

---

# 📦 โครงสร้างโปรเจกต์นี้

```
src/
  main.tsx          → entry point + Router + Providers
  App.tsx           → component ตัวอย่างเดิม (Vite template)
  TodoApp.tsx       → หน้า Todo หลัก (UI + filter)
  TodoItem.tsx      → แต่ละแถวงาน (มีโหมดแก้ไข)
  TodoDetail.tsx    → หน้ารายละเอียดงาน (useParams)
  TodoContext.tsx   → Context กลางเก็บ todos + logic
  Posts.tsx         → ลิสต์โพสต์ (ใช้ useFetch)
  PostsQuery.tsx    → ลิสต์โพสต์ (ใช้ TanStack Query + mutation)
  PostDetail.tsx    → รายละเอียดโพสต์ (API + useParams)
  SignupForm.tsx    → ฟอร์ม (React Hook Form + Zod)
  Home.tsx, About.tsx → หน้าทั่วไป
  useFetch.ts       → custom hook ดึงข้อมูล
  types.ts          → type Todo (ใช้ร่วมทุกไฟล์)
```

---

# ✅ ก้าวต่อไป

- [ ] ทำโปรเจกต์ของตัวเอง (สำคัญที่สุด — รวมทุกอย่าง)
- [ ] useReducer (จัดการ state ซับซ้อน)
- [ ] Next.js (framework ระดับอุตสาหกรรม)
- [ ] Testing (Vitest + React Testing Library)
- [ ] เชื่อม backend จริง (Supabase / Firebase) ให้ข้อมูล sync ข้ามเครื่อง
