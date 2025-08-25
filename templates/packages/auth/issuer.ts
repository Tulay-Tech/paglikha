import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import {
  type ExecutionContext,
  type KVNamespace,
} from "@cloudflare/workers-types";
import { subjects } from "./subjects";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { Resource } from "sst";
import { THEME_OPENAUTH } from "@openauthjs/openauth/ui/theme";

interface Env {
  AuthKV: KVNamespace;
}

async function getUser(email: string): Promise<string> {
  // First, try to find existing user
  const existingUser = await Resource.MyDatabase.prepare(
    "SELECT id FROM users WHERE email = ?"
  )
    .bind(email)
    .first();

  if (existingUser) {
    // User exists - this is a login
    return existingUser.id.toString();
  }

  // User doesn't exist - create new user (registration)
  const newUser = await Resource.MyDatabase.prepare(
    "INSERT INTO users (email) VALUES (?) RETURNING id"
  )
    .bind(email)
    .first();

  return newUser.id.toString();
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return issuer({
      theme: THEME_OPENAUTH,
      storage: CloudflareStorage({
        namespace: env.AuthKV,
      }),
      subjects,
      providers: {
        password: PasswordProvider(
          PasswordUI({
            sendCode: async (email, code) => {
              console.log(email, code);
            },
          })
        ),
      },
      success: async (ctx, value) => {
        if (value.provider === "password") {
          return ctx.subject("user", {
            id: await getUser(value.email),
          });
        }
        throw new Error("Invalid provider");
      },
    }).fetch(request, env, ctx);
  },
};
