import { Hono } from "hono";

import users from "./users/route";
import authMiddleware from "../middleware/authMiddleware";

// Extend the Context to include user information
type Variables = {
  user: {
    userId: string;
  };
};

type Env = {
  CLOUDFLARE_D1_TOKEN: string;
};

async function getUserInfo(userId: string) {
  return {
    userId,
    name: "Patrick Star",
  };
}

const app = new Hono<{ Variables: Variables; Bindings: Env }>().basePath(
  "/api"
);

app.get("/", (c) => c.text(c.env.CLOUDFLARE_D1_TOKEN));

app.get("/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json(await getUserInfo(user.userId));
});

app.get("/protected", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ message: "This is a protected route", userId: user.userId });
});

app.route("/users", users);

export default app;
