"use client";

import { useActionState } from "react";
import { sendMessage, type FormState } from "./actions";

const input =
  "w-full rounded-lg border border-background/20 bg-background/5 px-4 py-2.5 text-sm text-background placeholder:text-background/40 outline-none focus:border-background/60";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendMessage, {});

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg border border-background/20 px-4 py-6 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="sr-only" htmlFor="cf-name">Name</label>
      <input id="cf-name" name="name" required maxLength={120} placeholder="Your name" className={input} />
      <label className="sr-only" htmlFor="cf-email">Email</label>
      <input id="cf-email" name="email" type="email" required maxLength={200} placeholder="Your email" className={input} />
      <label className="sr-only" htmlFor="cf-message">Message</label>
      <textarea
        id="cf-message"
        name="message"
        required
        rows={4}
        maxLength={5000}
        placeholder="Your message"
        className={`${input} sm:col-span-2`}
      />
      {/* Honeypot for spam bots — hidden from people */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        {state.error && (
          <p role="alert" className="text-sm font-medium text-red-500">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
