import { createMiddleware } from "hono/factory";
import { createClient } from "@openauthjs/openauth/client";
import { subjects } from "../../auth/subjects";

type Env = {
  WORKERS_AUTH_URL: string;
};

// Extend the Context to include user information
type Variables = {
  user: {
    userId: string;
    // Add other user properties as needed
  };
};

// OpenAuth middleware
const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: Variables;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Authorization header required" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json({ error: "Bearer token required" }, 401);
  }

  try {
    const client = createClient({
      clientID: "api",
      issuer: c.env.WORKERS_AUTH_URL,
    });

    const verified = await client.verify(subjects, token);

    if (verified.err) {
      console.log("Verification error:", verified.err);
      return c.json({ error: "Invalid token" }, 401);
    }

    // Store user information in context variables
    c.set("user", {
      userId: verified.subject.properties.id,
      // Add other properties from verified.subject.properties as needed
    });

    await next();
  } catch (error) {
    console.log("Auth middleware error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});

export default authMiddleware;
