"use client";

import { useActionState, useEffect, useState } from "react";
import type { SiteContent } from "@/lib/default-content";
import { saveSiteContent, type FormState } from "../actions";

/* ---------------- Small form building blocks ---------------- */

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

function Field({
  label,
  value,
  onChange,
  multiline,
  hint,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      ) : (
        <input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} mt-1`}
        />
      )}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

/** Edits a list of strings as a textarea with one item per line. */
function Lines({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted">{label} — one per line</span>
      <textarea
        rows={rows}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        className={`${inputClass} mt-1`}
      />
    </label>
  );
}

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** A reorderable list of items with add / remove / move up / move down. */
function ItemList<T>({
  items,
  onChange,
  newItem,
  addLabel,
  summary,
  render,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  newItem: () => T;
  addLabel: string;
  summary: (item: T) => string;
  render: (item: T, set: (next: T) => void) => React.ReactNode;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    onChange(next);
  };
  const btn = "rounded-md border border-border px-2 py-1 text-xs hover:bg-background disabled:opacity-30";

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details key={i} className="group rounded-xl border border-border bg-background/40">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span className="truncate text-sm font-medium">
              <span className="mr-2 inline-block text-muted transition-transform group-open:rotate-90">›</span>
              {summary(item) || <em className="text-muted">(empty)</em>}
            </span>
            <span className="flex shrink-0 gap-1" onClick={(e) => e.preventDefault()}>
              <button type="button" className={btn} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label="Move up">
                ↑
              </button>
              <button
                type="button"
                className={btn}
                disabled={i === items.length - 1}
                onClick={() => move(i, i + 1)}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className={`${btn} text-red-600`}
                onClick={() => {
                  if (confirm("Remove this item?")) onChange(items.filter((_, j) => j !== i));
                }}
              >
                Remove
              </button>
            </span>
          </summary>
          <div className="space-y-4 border-t border-border p-4">
            {render(item, (nextItem) => onChange(items.map((x, j) => (j === i ? nextItem : x))))}
          </div>
        </details>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, newItem()])}
        className="w-full rounded-xl border border-dashed border-border py-2.5 text-sm text-muted hover:border-accent hover:text-accent"
      >
        + {addLabel}
      </button>
    </div>
  );
}

const grid2 = "grid gap-4 sm:grid-cols-2";

/* ---------------- The editor ---------------- */

export function ContentEditor({ initial }: { initial: SiteContent }) {
  const [c, setC] = useState(initial);
  const [savedJson, setSavedJson] = useState(() => JSON.stringify(initial));
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveSiteContent, {});

  // After a successful save, adopt the cleaned-up version the server stored.
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.saved) {
      setSavedJson(state.saved);
      setC(JSON.parse(state.saved));
    }
  }

  const json = JSON.stringify(c);
  const dirty = json !== savedJson;

  // Warn before closing the tab with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const p = c.profile;
  const setProfile = (patch: Partial<SiteContent["profile"]>) => setC({ ...c, profile: { ...p, ...patch } });

  return (
    <form action={formAction} className="space-y-6 pb-28">
      <input type="hidden" name="content" value={json} />
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit your website</h1>
        <p className="mt-1 text-sm text-muted">Make changes below, then press Save. Your site updates right away.</p>
      </div>

      <Card title="Profile" description="Shown at the top of your website.">
        <div className={grid2}>
          <Field label="Full name" value={p.name} onChange={(v) => setProfile({ name: v })} />
          <Field label="Short name (top bar)" value={p.shortName} onChange={(v) => setProfile({ shortName: v })} />
          <Field label="Job title" value={p.role} onChange={(v) => setProfile({ role: v })} />
          <Field label="Company" value={p.company} onChange={(v) => setProfile({ company: v })} />
          <Field label="Initials (logo)" value={p.initials} onChange={(v) => setProfile({ initials: v })} />
          <Field label="Availability" value={p.availability} onChange={(v) => setProfile({ availability: v })} />
        </div>
        <Field label="Tagline" multiline value={p.tagline} onChange={(v) => setProfile({ tagline: v })} />
        <Lines label="Locations" rows={2} value={p.locations} onChange={(v) => setProfile({ locations: v })} />
      </Card>

      <Card title="Contact & links">
        <div className={grid2}>
          <Field label="Email" value={p.email} onChange={(v) => setProfile({ email: v })} />
          <Field label="LinkedIn URL" value={p.linkedin} onChange={(v) => setProfile({ linkedin: v })} />
          <Field
            label="Photo"
            value={p.photo}
            placeholder="/profile.jpg"
            hint="Put the image in the project's public folder, then type its path. Empty = show initials."
            onChange={(v) => setProfile({ photo: v })}
          />
          <Field
            label="CV file"
            value={p.cvFile}
            placeholder="/cv.pdf"
            hint="Put the PDF in the public folder, then type its path. Empty = hide the button."
            onChange={(v) => setProfile({ cvFile: v })}
          />
        </div>
        <Field
          label="Contact heading"
          value={c.contact.heading}
          onChange={(v) => setC({ ...c, contact: { ...c.contact, heading: v } })}
        />
        <Field
          label="Contact text"
          multiline
          value={c.contact.text}
          onChange={(v) => setC({ ...c, contact: { ...c.contact, text: v } })}
        />
      </Card>

      <Card title="Key numbers" description="The four boxes under your name.">
        <ItemList
          items={c.stats}
          onChange={(stats) => setC({ ...c, stats })}
          newItem={() => ({ value: "", label: "" })}
          addLabel="Add number"
          summary={(s) => [s.value, s.label].filter(Boolean).join(" — ")}
          render={(s, set) => (
            <div className={grid2}>
              <Field label="Number" value={s.value} onChange={(v) => set({ ...s, value: v })} />
              <Field label="Label" value={s.label} onChange={(v) => set({ ...s, label: v })} />
            </div>
          )}
        />
      </Card>

      <Card title="About">
        <Field
          label="Heading"
          value={c.about.heading}
          onChange={(v) => setC({ ...c, about: { ...c.about, heading: v } })}
        />
        <ItemList
          items={c.about.paragraphs}
          onChange={(paragraphs) => setC({ ...c, about: { ...c.about, paragraphs } })}
          newItem={() => ""}
          addLabel="Add paragraph"
          summary={(t) => t.slice(0, 80)}
          render={(t, set) => <Field label="Paragraph" multiline value={t} onChange={set} />}
        />
      </Card>

      <Card title="Experience" description="Newest first. Use the arrows to reorder.">
        <ItemList
          items={c.experience}
          onChange={(experience) => setC({ ...c, experience })}
          newItem={() => ({ title: "", company: "", location: "", period: "", points: [] })}
          addLabel="Add job"
          summary={(j) => [j.title, j.company].filter(Boolean).join(" · ")}
          render={(j, set) => (
            <>
              <div className={grid2}>
                <Field label="Job title" value={j.title} onChange={(v) => set({ ...j, title: v })} />
                <Field label="Company" value={j.company} onChange={(v) => set({ ...j, company: v })} />
                <Field label="Location" value={j.location} onChange={(v) => set({ ...j, location: v })} />
                <Field
                  label="Dates"
                  value={j.period}
                  placeholder="Jan 2020 – Present"
                  onChange={(v) => set({ ...j, period: v })}
                />
              </div>
              <Lines label="What you did" rows={5} value={j.points} onChange={(v) => set({ ...j, points: v })} />
            </>
          )}
        />
      </Card>

      <Card title="Degrees">
        <ItemList
          items={c.degrees}
          onChange={(degrees) => setC({ ...c, degrees })}
          newItem={() => ({ title: "", school: "", period: "" })}
          addLabel="Add degree"
          summary={(d) => d.title}
          render={(d, set) => (
            <>
              <Field label="Degree" value={d.title} onChange={(v) => set({ ...d, title: v })} />
              <div className={grid2}>
                <Field label="School" value={d.school} onChange={(v) => set({ ...d, school: v })} />
                <Field label="Dates" value={d.period} onChange={(v) => set({ ...d, period: v })} />
              </div>
            </>
          )}
        />
      </Card>

      <Card title="Diplomas & certificates">
        <ItemList
          items={c.certifications}
          onChange={(certifications) => setC({ ...c, certifications })}
          newItem={() => ({ title: "", org: "", year: "" })}
          addLabel="Add certificate"
          summary={(d) => [d.title, d.year].filter(Boolean).join(" · ")}
          render={(d, set) => (
            <>
              <Field label="Title" value={d.title} onChange={(v) => set({ ...d, title: v })} />
              <div className={grid2}>
                <Field label="Institute" value={d.org} onChange={(v) => set({ ...d, org: v })} />
                <Field label="Year" value={d.year} onChange={(v) => set({ ...d, year: v })} />
              </div>
            </>
          )}
        />
        <Field
          label="Note under the list"
          multiline
          value={c.educationNote}
          onChange={(v) => setC({ ...c, educationNote: v })}
        />
      </Card>

      <Card title="Skills">
        <ItemList
          items={c.skillGroups}
          onChange={(skillGroups) => setC({ ...c, skillGroups })}
          newItem={() => ({ name: "", skills: [] })}
          addLabel="Add skill group"
          summary={(g) => g.name}
          render={(g, set) => (
            <>
              <Field label="Group name" value={g.name} onChange={(v) => set({ ...g, name: v })} />
              <Lines label="Skills" rows={6} value={g.skills} onChange={(v) => set({ ...g, skills: v })} />
            </>
          )}
        />
      </Card>

      <Card title="Languages & travel">
        <ItemList
          items={c.languages}
          onChange={(languages) => setC({ ...c, languages })}
          newItem={() => ({ name: "", level: "" })}
          addLabel="Add language"
          summary={(l) => [l.name, l.level].filter(Boolean).join(" — ")}
          render={(l, set) => (
            <div className={grid2}>
              <Field label="Language" value={l.name} onChange={(v) => set({ ...l, name: v })} />
              <Field label="Level" value={l.level} onChange={(v) => set({ ...l, level: v })} />
            </div>
          )}
        />
        <Lines
          label="Countries visited"
          rows={6}
          value={c.countriesVisited}
          onChange={(v) => setC({ ...c, countriesVisited: v })}
        />
      </Card>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-sm" role="status">
            {state.error ? (
              <span className="text-red-600">{state.error}</span>
            ) : dirty ? (
              <span className="text-muted">You have unsaved changes</span>
            ) : state.ok ? (
              <span className="text-emerald-600">{state.message}</span>
            ) : (
              <span className="text-muted">All changes saved</span>
            )}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!dirty || pending}
              onClick={() => setC(JSON.parse(savedJson))}
              className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
            >
              Undo changes
            </button>
            <button
              type="submit"
              disabled={!dirty || pending}
              className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-background disabled:opacity-40"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
