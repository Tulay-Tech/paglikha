import { Hono } from "hono";

const users = new Hono();

users.get("/", (c) => c.text("users"));

export default users;
