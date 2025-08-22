import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const employee = sqliteTable("employee", {
  employee_id: text("employee_id").primaryKey(),
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  status: text("status").notNull(),
  startDate: text("startDate").notNull(),
  integrations: text("integrations", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .default(sql`'[]'`),
});
