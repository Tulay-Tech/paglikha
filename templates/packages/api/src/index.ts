import { Hono } from "hono";
import { createClient } from "@openauthjs/openauth/client";
import { subjects } from "../../auth/subjects";

type Env = {
  WORKERS_AUTH_URL: string;
};

async function getUserInfo(userId: string) {
  return {
    userId,
    name: "Patrick Star",
  };
}

const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("ok"));

app.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.status(401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const client = createClient({
      clientID: "api",
      issuer: c.env.WORKERS_AUTH_URL,
    });

    const verified = await client.verify(subjects, token);

    if (verified.err) {
      console.log("Verification error:", verified.err);
      return c.status(401);
    }

    return c.json(await getUserInfo(verified.subject.properties.id));
  } catch (error) {
    console.log("Full error:", error);
    c.status(500);
    return c.json({ error: "Verification failed" });
  }
});

export default app;
