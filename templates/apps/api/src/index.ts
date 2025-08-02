import { Hono } from "hono";
import { getDatabase } from "@workspace/db";
import { users } from "@workspace/db/schema";

const app = new Hono();
const db = getDatabase(process.env.MAIN_DB_URL!);

app.get("/", async (c) => {
  const result = await db.select().from(users);
  return c.json(result);
});

export default app;
