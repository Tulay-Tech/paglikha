import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.MAIN_DB_URL) {
  throw new Error("MAIN_DB_URL environment variable is not set");
}

export default defineConfig({
  schema: "./schema/index.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.MAIN_DB_URL,
  },
});
