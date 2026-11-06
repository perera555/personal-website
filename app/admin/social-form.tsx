"use client";

import { useActionState, useEffect, useRef } from "react";
import { addSocialLink, type FormState } from "../actions";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

export function AddSocialForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(addSocialLink, {});

  // Clear the form after a successful add.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-3 rounded-2xl border border-border bg-surface/90 backdrop-blur depth p-5">
      <label className="block">
        <span className="text-xs font-medium text-muted">Post link</span>
        <input
          name="url"
          required
          placeholder="https://www.facebook.com/…  or  https://www.instagram.com/p/…"
          className={`${inputClass} mt-1`}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-muted">Note (optional — only you see this)</span>
        <input name="note" maxLength={300} placeholder="e.g. Trip to Thailand" className={`${inputClass} mt-1`} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          disabled={pending}
          className="rounded-xl bg-linear-to-br from-accent to-accent/75 shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 hover:shadow-xl px-5 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add to website"}
        </button>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.ok && <p className="text-sm text-emerald-600">{state.message}</p>}
      </div>
    </form>
  );
}
