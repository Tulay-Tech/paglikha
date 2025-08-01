import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.MAIN_DB_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const database = drizzle({ client });
export * from "./schema";
