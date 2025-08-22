import { db } from "./db";

const kv = new sst.cloudflare.Kv("CloudflareAuthKV");

export const auth = new sst.cloudflare.Worker("CloudflareAuth", {
  handler: "packages/auth/issuer.ts",
  link: [kv, db],
  url: true,
});
