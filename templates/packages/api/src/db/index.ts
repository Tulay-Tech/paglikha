import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";
import * as schema from "./schema";

// Factory for Drizzle with D1
export const createDb = (d1: D1Database) => drizzle(d1, { schema });
