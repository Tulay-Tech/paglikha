import { Hono } from "hono";
import { database } from "@workspace/db";
import { users } from "@workspace/db/schema";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

const db = database;

async function getUsers() {
  const result = await db.select().from(users);
  return result;
}

export default app;
