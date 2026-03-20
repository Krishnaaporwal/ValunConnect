import { pgTable, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { volunteersTable } from "./volunteers";
import { eventsTable } from "./events";

export const applicationStatusEnum = pgEnum("application_status", ["pending", "accepted", "rejected"]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  volunteerId: integer("volunteer_id").references(() => volunteersTable.id).notNull(),
  eventId: integer("event_id").references(() => eventsTable.id).notNull(),
  status: applicationStatusEnum("status").default("pending").notNull(),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, appliedAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
