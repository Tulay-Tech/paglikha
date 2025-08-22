import { Hono } from "hono";
import { cors } from "hono/cors";
import { Resource } from "sst";
import { createClient } from "@openauthjs/openauth/client";
import { subjects } from "../../auth/subjects";

const app = new Hono();

// Create OpenAuth client
const client = createClient({
  clientID: "hono-api",
  issuer: Resource.CloudflareAuth.url,
});

// Enable CORS for frontend
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://*"], // Add your domain
    credentials: true,
  })
);

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.set("user", null);
    return next();
  }

  const token = authHeader.split(" ")[1];

  const verified = await client.verify(subjects, token);

  if (verified.err) {
    c.set("user", null);
    return next();
  }

  c.set("user", verified.subject);
  return next();
};

// Apply auth middleware globally
app.use("*", authMiddleware);

// Protected route middleware
const requireAuth = async (c: any, next: any) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  return next();
};

// Public routes
app.get("/", async (c) => {
  const user = c.get("user");
  return c.json({
    message: "Hono API with OpenAuth",
    authenticated: !!user,
    user: user || null,
  });
});

// Protected routes
app.get("/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

app.get("/protected", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({
    message: "This is a protected route",
    userId: user.properties.id,
  });
});

export default app;
