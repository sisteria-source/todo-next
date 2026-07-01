"use client"; // ใช้ hook → Client Component

import { useActionState } from "react";
import { addTodo, type AddState } from "./actions";
import SubmitButton from "./SubmitButton";

const initialState: AddState = { error: null }; // state เริ่มต้น (ยังไม่มี error)

export default function AddTodoForm() {
  // useActionState(action, ค่าเริ่มต้น) → คืน [state ปัจจุบัน, ฟังก์ชันผูกกับ form]
  //   - state = ค่าที่ addTodo "return" กลับมา (เช่น { error: "..." })
  //   - formAction = เอาไปใส่ใน <form action={...}> แทน addTodo ตรงๆ
  const [state, formAction] = useActionState(addTodo, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <div className="flex gap-2">
        <input
          name="text"
          placeholder="เพิ่มงานใหม่..."
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
        />
        <SubmitButton />
      </div>

      {/* แสดง error ถ้า action ส่งกลับมา */}
      {state.error && <p className="text-sm text-red-500">⚠️ {state.error}</p>}
    </form>
  );
}
