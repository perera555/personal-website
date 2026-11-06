import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";

/**
 * Where the site's data lives:
 * - Online (Vercel): an Upstash Redis database, when its environment variables are set.
 * - On your computer: JSON files in the /content folder.
 */

type Key = "site" | "posts" | "messages" | "social";

const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const PREFIX = "portfolio:";
const DIR = path.join(process.cwd(), "content");
const file = (key: Key) => path.join(DIR, `${key}.json`);

export async function readStore<T>(key: Key): Promise<T | null> {
  if (redis) return (await redis.get<T>(PREFIX + key)) ?? null;
  try {
    return JSON.parse(await readFile(file(key), "utf-8")) as T;
  } catch {
    return null;
  }
}

export async function writeStore(key: Key, data: unknown) {
  if (redis) {
    await redis.set(PREFIX + key, data);
    return;
  }
  // Write to a temp file then rename, so a crash never leaves a half-written file.
  await mkdir(DIR, { recursive: true });
  const tmp = `${file(key)}.tmp`;
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmp, file(key));
}
