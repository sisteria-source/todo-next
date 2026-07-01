// 🗄️ ไฟล์เชื่อม SQLite database — ทำงานบน server เท่านั้น (มี native module)
//    ข้อมูลเก็บในไฟล์ todos.db บนดิสก์ → restart server ก็ไม่หายแล้ว!

import Database from "better-sqlite3";
import path from "node:path";

export type Todo = {
  id: number;
  text: string;
  done: boolean;
};

// เปิดไฟล์ database (ถ้าไม่มีจะสร้างให้) ที่ root โปรเจกต์ → todos.db
// ⚠️ ตอน dev Next.js reload โมดูลบ่อย → cache connection ไว้ใน globalThis กันเปิดซ้ำหลายอัน
const globalForDb = globalThis as unknown as { _db?: Database.Database };
const db =
  globalForDb._db ?? new Database(path.join(process.cwd(), "todos.db"));
if (!globalForDb._db) globalForDb._db = db;

// สร้างตารางถ้ายังไม่มี (รันกี่ครั้งก็ปลอดภัยเพราะมี IF NOT EXISTS)
// SQLite ไม่มีชนิด boolean → เก็บ done เป็นเลข 0/1 แทน
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT    NOT NULL,
    done INTEGER NOT NULL DEFAULT 0
  )
`);

// ใส่ข้อมูลตั้งต้นเฉพาะ "ครั้งแรกสุด" (ตอนตารางยังว่าง)
const { n } = db.prepare("SELECT COUNT(*) AS n FROM todos").get() as {
  n: number;
};
if (n === 0) {
  const insert = db.prepare("INSERT INTO todos (text, done) VALUES (?, ?)");
  insert.run("เรียน Next.js routing", 1);
  insert.run("เข้าใจ Server Component", 0);
  insert.run("ทำหน้า detail ต่อ", 0);
}

// ───────── ฟังก์ชัน query (ให้ actions.ts / page.tsx เรียกใช้) ─────────

// แถวดิบจาก SQLite (done เป็นเลข) → แปลงเป็น Todo (done เป็น boolean)
type Row = { id: number; text: string; done: number };
const toTodo = (r: Row): Todo => ({ id: r.id, text: r.text, done: r.done === 1 });

// อ่านทั้งหมด — .all() = คืนทุกแถว
export function getTodos(): Todo[] {
  const rows = db.prepare("SELECT * FROM todos ORDER BY id").all() as Row[];
  return rows.map(toTodo);
}

// นับสถิติ — ให้ database นับด้วย COUNT (เร็วกว่าโหลดทุกแถวมานับใน JS)
export function getStats(): { total: number; done: number; pending: number } {
  const total = (
    db.prepare("SELECT COUNT(*) AS n FROM todos").get() as { n: number }
  ).n;
  const done = (
    db.prepare("SELECT COUNT(*) AS n FROM todos WHERE done = 1").get() as {
      n: number;
    }
  ).n;
  return { total, done, pending: total - done };
}

// อ่านตัวเดียวตาม id — .get() = คืนแถวเดียว (หรือ undefined ถ้าไม่เจอ)
export function getTodoById(id: number): Todo | undefined {
  const row = db.prepare("SELECT * FROM todos WHERE id = ?").get(id) as
    | Row
    | undefined;
  return row ? toTodo(row) : undefined;
}

// เพิ่ม — ? คือ placeholder กัน SQL injection (ห้ามต่อ string เอง!)
export function insertTodo(text: string): void {
  db.prepare("INSERT INTO todos (text, done) VALUES (?, 0)").run(text);
}

// สลับ done (NOT done = กลับ 0↔1)
export function toggleTodoDone(id: number): void {
  db.prepare("UPDATE todos SET done = NOT done WHERE id = ?").run(id);
}

// แก้ข้อความงาน — ? 2 ตัว ส่งค่าเรียงตามลำดับ: (text, id)
export function updateTodoText(id: number, text: string): void {
  db.prepare("UPDATE todos SET text = ? WHERE id = ?").run(text, id);
}

// ลบ
export function deleteTodoById(id: number): void {
  db.prepare("DELETE FROM todos WHERE id = ?").run(id);
}
