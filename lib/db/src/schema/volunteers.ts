import { pgTable, serial, integer, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const volunteersTable = pgTable("volunteers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  name: text("name").notNull(),
  location: text("location"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  skills: text("skills").array().default([]).notNull(),
  interests: text("interests").array().default([]).notNull(),
  bio: text("bio"),
  availability: text("availability"),
  totalHours: doublePrecision("total_hours").default(0).notNull(),
  eventsParticipated: integer("events_participated").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVolunteerSchema = createInsertSchema(volunteersTable).omit({ id: true, createdAt: true });
export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteersTable.$inferSelect;
