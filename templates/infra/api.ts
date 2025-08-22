import { auth } from "./auth";
import { db } from "./db";

export const api = new sst.cloudflare.Worker("Hono", {
  url: true,
  link: [auth, db],
  handler: "packages/api/src/index.ts",
});
