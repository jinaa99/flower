"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { buttonClass, inputClass, labelClass } from "../ui";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="password" className={labelClass}>
          Нууц үг
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          className={inputClass}
        />
      </div>
      <button type="submit" disabled={pending} className={`${buttonClass} w-full`}>
        {pending ? "Шалгаж байна…" : "Нэвтрэх"}
      </button>
      <p role="status" className="min-h-5 text-sm text-blush-300">
        {state?.message}
      </p>
    </form>
  );
}
