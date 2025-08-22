import { createServerFileRoute } from "@tanstack/react-start/server";

// routes/hello.ts
export const ServerRoute = createServerFileRoute("/api/users").methods({
  GET: async ({ request }) => {
    return new Response("Hello, World! from " + request.url);
  },
  POST: async ({ request }) => {
    return new Response("Hello, World! from " + request.url);
  },
});
