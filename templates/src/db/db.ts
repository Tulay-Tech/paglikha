// db.ts
import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

let dbInstance: ReturnType<typeof drizzle> | null = null;

/**
 * Initialize Drizzle with the D1 binding.
 * Must be called once per request.
 */
export function initDb(db: D1Database) {
  if (!dbInstance) {
    dbInstance = drizzle(db);
  }
}

/**
 * Get the Drizzle instance anywhere after initialization.
 */
export const db = () => {
  if (!dbInstance)
    throw new Error("DB not initialized. Call initDb(env.DB) first!");
  return dbInstance;
};
