import { cacheLife, cacheTag } from "next/cache";
import { defaultContent, type SiteContent } from "./default-content";
import { readStore, writeStore } from "./store";

export const CONTENT_TAG = "site-content";

/* ---------------- Site content ---------------- */

export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const saved = await readStore<unknown>("site");
  return saved ? sanitizeContent(saved) : defaultContent;
}

export async function saveContent(content: SiteContent) {
  await writeStore("site", content);
}

/* ---------------- Messages (contact form inbox) ---------------- */

export type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export async function getMessages(): Promise<Message[]> {
  const all = await readStore<Message[]>("messages");
  return Array.isArray(all) ? all : [];
}

export async function addMessage(m: Message) {
  const all = await getMessages();
  all.unshift(m);
  await writeStore("messages", all.slice(0, 500));
}

export async function updateMessages(fn: (all: Message[]) => Message[]) {
  await writeStore("messages", fn(await getMessages()));
}

/* ---------------- Validation ---------------- */
// Turns any untrusted input into a valid SiteContent: wrong types become
// empty values, strings are trimmed and length-limited, blank list items dropped.

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === "object" && !Array.isArray(v) ? (v as Obj) : {});
const str = (v: unknown, max = 2000) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const arr = (v: unknown, max = 100): unknown[] => (Array.isArray(v) ? v.slice(0, max) : []);
const strList = (v: unknown, max = 100) => arr(v, max).map((s) => str(s, 500)).filter(Boolean);
const list = <T,>(v: unknown, map: (o: Obj) => T, keep: (t: T) => boolean) =>
  arr(v).map((x) => map(obj(x))).filter(keep);

// Only allow http(s) links or site-relative paths, to block "javascript:" URLs.
const safeUrl = (v: unknown) => {
  const s = str(v, 500);
  return /^(https?:\/\/|\/(?!\/))/i.test(s) ? s : "";
};

export function sanitizeContent(input: unknown): SiteContent {
  const c = obj(input);
  const p = obj(c.profile);
  const about = obj(c.about);
  const contact = obj(c.contact);

  return {
    profile: {
      name: str(p.name, 120),
      shortName: str(p.shortName, 120),
      initials: str(p.initials, 4),
      role: str(p.role, 120),
      company: str(p.company, 200),
      locations: strList(p.locations, 10),
      email: str(p.email, 200),
      linkedin: safeUrl(p.linkedin),
      facebook: safeUrl(p.facebook),
      instagram: safeUrl(p.instagram),
      youtube: safeUrl(p.youtube),
      photo: safeUrl(p.photo),
      cvFile: safeUrl(p.cvFile),
      availability: str(p.availability, 120),
      tagline: str(p.tagline, 400),
    },
    about: { heading: str(about.heading, 200), paragraphs: strList(about.paragraphs, 10) },
    stats: list(c.stats, (o) => ({ value: str(o.value, 20), label: str(o.label, 80) }), (s) => !!(s.value || s.label)),
    experience: list(
      c.experience,
      (o) => ({
        title: str(o.title, 200),
        company: str(o.company, 200),
        location: str(o.location, 120),
        period: str(o.period, 80),
        points: strList(o.points, 20),
      }),
      (j) => !!(j.title || j.company),
    ),
    degrees: list(
      c.degrees,
      (o) => ({ title: str(o.title, 200), school: str(o.school, 200), period: str(o.period, 80) }),
      (d) => !!d.title,
    ),
    certifications: list(
      c.certifications,
      (o) => ({ title: str(o.title, 200), org: str(o.org, 200), year: str(o.year, 20) }),
      (d) => !!d.title,
    ),
    educationNote: str(c.educationNote, 500),
    skillGroups: list(c.skillGroups, (o) => ({ name: str(o.name, 80), skills: strList(o.skills, 40) }), (g) => !!g.name),
    languages: list(c.languages, (o) => ({ name: str(o.name, 60), level: str(o.level, 60) }), (l) => !!l.name),
    countriesVisited: strList(c.countriesVisited, 100),
    contact: { heading: str(contact.heading, 200), text: str(contact.text, 500) },
  };
}
