import { defineConfig } from "drizzle-kit";

if (!process.env.MAIN_DB_URL) {
  throw new Error("MAIN_DB_URL environment variable is not set");
}

export default defineConfig({
  schema: "./packages/db/schema/index.ts",
  out: "./packages/db/drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.MAIN_DB_URL,
  },
});
