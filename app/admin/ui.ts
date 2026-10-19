import { useActionState, useTransition, type FormEvent } from "react";
import type { FormState } from "./actions";

export const inputClass =
  "w-full border-b border-ivory/20 bg-transparent py-2 text-ivory tabular-nums placeholder:text-ivory/30 transition-colors duration-300 outline-none focus:border-blush-300";

export const labelClass = "mb-1 block text-[0.65rem] tracking-[0.2em] text-ivory/50 uppercase";

export const buttonClass =
  "bg-gold-soft px-6 py-3 text-xs tracking-[0.2em] text-plum-950 uppercase transition-colors duration-500 hover:bg-blush-100 disabled:cursor-wait disabled:opacity-60";

/**
 * `<form action>` нь action дууссаны дараа талбаруудыг defaultValue руу reset хийдэг —
 * алдаа гарвал оруулсан утга алдагдана. onSubmit + transition-оор дуудвал reset хийхгүй.
 */
export function useFormAction(action: (prev: FormState, formData: FormData) => Promise<FormState>) {
  const [state, dispatch] = useActionState(action, null);
  const [pending, startTransition] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, pending, onSubmit };
}
