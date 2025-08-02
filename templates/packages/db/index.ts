import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

export const getDatabase = (url: string) => {
  const client = createClient({
    url: url!,
  });
  return drizzle(client);
};

export * from "./schema/index.js";
