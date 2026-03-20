import { pgTable, serial, integer, text, timestamp, doublePrecision, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizersTable } from "./organizers";

export const eventTypeEnum = pgEnum("event_type", ["Government", "Private", "NGO"]);

export const eventsTable = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").references(() => organizersTable.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").array().default([]).notNull(),
  eventType: eventTypeEnum("event_type").notNull(),
  category: text("category"),
  dateTime: timestamp("date_time").notNull(),
  location: text("location").notNull(),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  volunteersNeeded: integer("volunteers_needed").notNull(),
  volunteersAccepted: integer("volunteers_accepted").default(0).notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  paymentAmount: doublePrecision("payment_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(eventsTable).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof eventsTable.$inferSelect;
