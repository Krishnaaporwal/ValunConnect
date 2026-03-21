import { pgTable, serial, integer, text, timestamp, doublePrecision, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const orgTypeEnum = pgEnum("org_type", ["NGO", "Government", "Private"]);

export const organizersTable = pgTable("organizers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id).notNull().unique(),
  organizationName: text("organization_name").notNull(),
  location: text("location"),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  organizationType: orgTypeEnum("organization_type").notNull(),
  ngoRegistrationNumber: text("ngo_registration_number"),
  govtType: text("govt_type"),
  ngoVerified: boolean("ngo_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertOrganizerSchema = createInsertSchema(organizersTable).omit({ id: true, createdAt: true });
export type InsertOrganizer = z.infer<typeof insertOrganizerSchema>;
export type Organizer = typeof organizersTable.$inferSelect;
