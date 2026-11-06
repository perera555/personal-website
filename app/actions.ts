"use server";

import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, endSession, isAdmin, isPasswordConfigured, startSession } from "@/lib/auth";
import { addMessage, CONTENT_TAG, sanitizeContent, saveContent, updateMessages } from "@/lib/content";
import { POSTS_TAG, removePost, upsertPost } from "@/lib/posts";
import { addSocialPost, parseSocialLink, removeSocialPost, SOCIAL_TAG } from "@/lib/social";

export type FormState = { ok?: boolean; error?: string; message?: string; saved?: string };

/* ---------------- Auth ---------------- */

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  if (!isPasswordConfigured()) {
    return { error: "Admin password isn't set up. Add ADMIN_PASSWORD (8+ characters) to .env.local and restart." };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800)); // slow down guessing
    return { error: "Wrong password." };
  }
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}

/* ---------------- Content ---------------- */

export async function saveSiteContent(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(formData.get("content") ?? ""));
  } catch {
    return { error: "Could not read the form data." };
  }
  const content = sanitizeContent(parsed);
  if (!content.profile.name) return { error: "Your name can't be empty." };

  try {
    await saveContent(content);
  } catch {
    return { error: "Saving failed — the server can't write to the content folder." };
  }
  updateTag(CONTENT_TAG);
  // Send back the cleaned-up version so the editor shows exactly what was stored.
  return { ok: true, message: "Saved. Your website is updated.", saved: JSON.stringify(content) };
}

/* ---------------- Blog ---------------- */

export async function savePost(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  let input: Record<string, unknown>;
  try {
    input = JSON.parse(String(formData.get("post") ?? ""));
  } catch {
    return { error: "Could not read the form data." };
  }
  const id = String(formData.get("id") ?? "") || null;
  if (!String(input.title ?? "").trim()) return { error: "Please give the post a title." };

  let post;
  try {
    post = await upsertPost(input, id, new Date().toISOString());
  } catch {
    return { error: "Saving failed — the server can't write to the content folder." };
  }
  updateTag(POSTS_TAG);
  if (!id) redirect(`/admin?tab=blog&post=${post.id}&created=1`);
  return {
    ok: true,
    message: post.published ? "Saved and published." : "Saved as draft.",
    saved: JSON.stringify(post),
  };
}

export async function deletePost(formData: FormData) {
  await requireAdmin();
  await removePost(String(formData.get("id")));
  updateTag(POSTS_TAG);
  redirect("/admin?tab=blog");
}

/* ---------------- Social posts ---------------- */

export async function addSocialLink(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseSocialLink(String(formData.get("url") ?? "").slice(0, 3000));
  if (!parsed) {
    return {
      error:
        "That link wasn't recognised. Paste the link of one post from Facebook, Instagram, LinkedIn or YouTube (starting with https://).",
    };
  }
  try {
    await addSocialPost({
      ...parsed,
      id: crypto.randomUUID(),
      note: String(formData.get("note") ?? "").trim().slice(0, 300),
      addedAt: new Date().toISOString(),
    });
  } catch {
    return { error: "Saving failed — please try again." };
  }
  updateTag(SOCIAL_TAG);
  refresh();
  return { ok: true, message: `Added your ${parsed.platform} post to the website.` };
}

export async function deleteSocialLink(formData: FormData) {
  await requireAdmin();
  await removeSocialPost(String(formData.get("id")));
  updateTag(SOCIAL_TAG);
  refresh();
}

/* ---------------- Contact form ---------------- */

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  // Hidden "website" field: real people leave it empty, spam bots fill it in.
  if (String(formData.get("website") ?? "")) return { ok: true, message: "Thanks! Your message has been sent." };

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const email = String(formData.get("email") ?? "").trim().slice(0, 200);
  const message = String(formData.get("message") ?? "").trim().slice(0, 5000);

  if (!name || !message) return { error: "Please fill in your name and a message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Please enter a valid email address." };

  try {
    await addMessage({
      id: crypto.randomUUID(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch {
    return { error: "Sorry, the message couldn't be sent. Please email me directly." };
  }
  return { ok: true, message: "Thanks! Your message has been sent." };
}

export async function markMessageRead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const read = formData.get("read") === "true";
  await updateMessages((all) => all.map((m) => (m.id === id ? { ...m, read } : m)));
  refresh();
}

export async function deleteMessage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await updateMessages((all) => all.filter((m) => m.id !== id));
  refresh();
}
