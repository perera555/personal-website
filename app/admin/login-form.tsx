"use client";

import { useActionState } from "react";
import { TiltCard } from "@/components/tilt-card";
import { login, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <div className="relative grid min-h-[85vh] place-items-center overflow-hidden px-4 py-16">
      <div aria-hidden className="glow -top-32 -left-24 size-[28rem]" />
      <div aria-hidden className="glow -right-32 -bottom-32 size-[26rem] opacity-60" />

      <div className="rise relative w-full max-w-sm">
        {/* Floating 3D cube */}
        <div aria-hidden className="scene float mx-auto mb-10 grid size-28 place-items-center">
          <div className="cube" style={{ ["--s" as string]: "5rem" }}>
            {["🔒", "DP", "Blog", "Admin", "✦", "✎"].map((t, i) => (
              <div key={i} className="cube-face">
                <span className="font-display text-xl font-semibold text-accent">{t}</span>
              </div>
            ))}
          </div>
        </div>

        <TiltCard max={6} className="rounded-3xl border border-border bg-surface/80 p-8 backdrop-blur-xl depth">
          <form action={action} className="pop">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Private area</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Admin login</h1>
            <p className="mt-1 text-sm text-muted">Sign in to write posts and edit your website.</p>
            <label htmlFor="password" className="mt-7 block text-xs font-medium text-muted">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="current-password"
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm shadow-inner outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
            />
            {state.error && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {state.error}
              </p>
            )}
            <button
              disabled={pending}
              className="mt-6 w-full rounded-xl bg-linear-to-br from-accent to-accent/75 px-4 py-3 text-sm font-medium text-background shadow-lg shadow-accent/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
            >
              {pending ? "Signing in…" : "Sign in →"}
            </button>
          </form>
        </TiltCard>
        <p className="mt-6 text-center text-xs text-muted">
          <a href="/" className="hover:text-accent">
            ← Back to website
          </a>
        </p>
      </div>
    </div>
  );
}
