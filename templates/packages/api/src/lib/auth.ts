import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { reactStartCookies } from "better-auth/react-start";
import * as schema from "../db/schema";
import { createDb } from "../db";
import { D1Database } from "@cloudflare/workers-types";

export function initAuth() {
  return betterAuth({
    database: (ctx: { env: { MyDatabase: D1Database } }) =>
      drizzleAdapter(() => createDb(ctx.env.MyDatabase), {
        provider: "sqlite",
        schema,
      }),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [reactStartCookies()],
  });
}
