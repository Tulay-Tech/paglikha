import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types";
import { initAuth } from "./lib/auth";
import users from "./users/route";

const app = new Hono<{
  Bindings: {
    MyDatabase: D1Database;
  };
  Variables: {
    user: ReturnType<typeof initAuth>["$Infer"]["Session"]["user"] | null;
    session: ReturnType<typeof initAuth>["$Infer"]["Session"]["session"] | null;
  };
}>().basePath("/api");

// Middleware creates an auth instance per request
app.use("*", async (c, next) => {
  const auth = initAuth();

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return c.body("unauthorized", 401);
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.get("/", (c) => c.text("ok"));

// Auth routes
app.on(["POST", "GET"], "/auth/*", (c) => {
  const auth = initAuth();
  return auth.handler(c.req.raw);
});

// Session route
app.get("/session", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  return c.json({ user, session });
});

app.route("/users", users);

export default app;
