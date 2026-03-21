import { Router, type IRouter } from "express";
import { db, eventsTable, organizersTable, volunteersTable, applicationsTable } from "@workspace/db";
import { eq, and, ilike, sql, inArray } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";
import { calculateMatchScore } from "../lib/matching.js";
import { z } from "zod";

const router: IRouter = Router();

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()).optional().default([]),
  eventType: z.enum(["Government", "Private", "NGO"]),
  category: z.string().optional(),
  dateTime: z.string(),
  location: z.string().min(1),
  lat: z.number().optional(),
  lng: z.number().optional(),
  volunteersNeeded: z.number().int().positive(),
  isUrgent: z.boolean().optional().default(false),
  paymentAmount: z.number().optional(),
});

async function getEventWithOrganizer(eventId: number) {
  const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, eventId)).limit(1);
  if (!event) return null;

  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, event.organizerId)).limit(1);

  return {
    ...event,
    organizerName: organizer?.organizationName ?? "Unknown",
    organizerType: organizer?.organizationType ?? "NGO",
  };
}

router.get("/recommended", requireAuth, requireRole("volunteer"), async (req, res) => {
  const user = (req as any).user;
  const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, user.profileId)).limit(1);

  if (!volunteer) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const events = await db.select().from(eventsTable);
  const organizers = await db.select().from(organizersTable);
  const orgMap = new Map(organizers.map((o) => [o.id, o]));

  const eventsWithMatch = events.map((event) => {
    const match = calculateMatchScore(volunteer, event);
    const org = orgMap.get(event.organizerId);
    return {
      ...event,
      organizerName: org?.organizationName ?? "Unknown",
      organizerType: org?.organizationType ?? "NGO",
      ...match,
    };
  });

  eventsWithMatch.sort((a, b) => {
    if (b.isUrgent && !a.isUrgent) return 1;
    if (a.isUrgent && !b.isUrgent) return -1;
    return b.matchScore - a.matchScore;
  });

  res.json(eventsWithMatch);
});

router.get("/", async (req, res) => {
  const { category, skills, urgent, search } = req.query;

  let query = db.select().from(eventsTable).$dynamic();

  const conditions: any[] = [];

  if (category) {
    conditions.push(ilike(eventsTable.category, `%${category}%`));
  }

  if (urgent === "true") {
    conditions.push(eq(eventsTable.isUrgent, true));
  }

  if (search) {
    conditions.push(ilike(eventsTable.title, `%${search}%`));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const events = await query;
  const organizers = await db.select().from(organizersTable);
  const orgMap = new Map(organizers.map((o) => [o.id, o]));

  let result = events.map((event) => {
    const org = orgMap.get(event.organizerId);
    return {
      ...event,
      organizerName: org?.organizationName ?? "Unknown",
      organizerType: org?.organizationType ?? "NGO",
    };
  });

  if (skills) {
    const skillList = (skills as string).split(",").map((s) => s.toLowerCase().trim());
    result = result.filter((event) =>
      event.requiredSkills.some((rs) =>
        skillList.some((sl) => rs.toLowerCase().includes(sl) || sl.includes(rs.toLowerCase()))
      )
    );
  }

  result.sort((a, b) => {
    if (b.isUrgent && !a.isUrgent) return 1;
    if (a.isUrgent && !b.isUrgent) return -1;
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  res.json(result);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }

  const event = await getEventWithOrganizer(id);
  if (!event) {
    res.status(404).json({ error: "Not found", message: "Event not found" });
    return;
  }

  res.json(event);
});

router.get("/:id/applications", requireAuth, requireRole("organizer"), async (req, res) => {
  const user = (req as any).user;
  const eventId = parseInt(req.params.id as string);

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }

  const [event] = await db.select().from(eventsTable).where(
    and(eq(eventsTable.id, eventId), eq(eventsTable.organizerId, user.profileId))
  ).limit(1);

  if (!event) {
    res.status(403).json({ error: "Forbidden", message: "Event not found or not yours" });
    return;
  }

  const apps = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.eventId, eventId));

  const result = await Promise.all(
    apps.map(async (app) => {
      const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, app.volunteerId)).limit(1);
      const match = volunteer ? calculateMatchScore(volunteer, event) : null;
      return {
        ...app,
        volunteer: volunteer
          ? {
              id: volunteer.id,
              name: volunteer.name,
              email: "",
              location: volunteer.location,
              skills: volunteer.skills,
              interests: volunteer.interests,
              bio: volunteer.bio,
              totalHours: volunteer.totalHours,
              eventsParticipated: volunteer.eventsParticipated,
              createdAt: volunteer.createdAt,
            }
          : null,
        matchScore: match?.matchScore ?? 0,
        matchLabel: match?.matchLabel ?? "Low Match",
      };
    })
  );

  res.json(result);
});

router.post("/", requireAuth, requireRole("organizer"), async (req, res) => {
  const user = (req as any).user;

  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const data = parsed.data;

  const parsedDate = new Date(data.dateTime);
  if (isNaN(parsedDate.getTime())) {
    res.status(400).json({ error: "Validation error", message: "Invalid dateTime value" });
    return;
  }

  if (data.eventType === "NGO") {
    const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);
    if (!organizer?.ngoVerified) {
      res.status(400).json({ error: "NGO not verified", message: "Please verify your NGO registration before creating NGO events" });
      return;
    }
  }

  const [event] = await db.insert(eventsTable).values({
    organizerId: user.profileId,
    title: data.title,
    description: data.description,
    requiredSkills: data.requiredSkills,
    eventType: data.eventType,
    category: data.category ?? null,
    dateTime: parsedDate,
    location: data.location,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    volunteersNeeded: data.volunteersNeeded,
    isUrgent: data.isUrgent,
    paymentAmount: data.paymentAmount ?? null,
  }).returning();

  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);

  res.status(201).json({
    ...event,
    organizerName: organizer?.organizationName ?? "Unknown",
    organizerType: organizer?.organizationType ?? "NGO",
  });
});

router.put("/:id", requireAuth, requireRole("organizer"), async (req, res) => {
  const user = (req as any).user;
  const eventId = parseInt(req.params.id as string);

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }

  const parsed = createEventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(eventsTable).where(
    and(eq(eventsTable.id, eventId), eq(eventsTable.organizerId, user.profileId))
  ).limit(1);

  if (!existing) {
    res.status(403).json({ error: "Forbidden", message: "Event not found or not yours" });
    return;
  }

  const data = parsed.data;
  const parsedDateUpdate = new Date(data.dateTime);
  if (isNaN(parsedDateUpdate.getTime())) {
    res.status(400).json({ error: "Validation error", message: "Invalid dateTime value" });
    return;
  }
  const [updated] = await db.update(eventsTable).set({
    title: data.title,
    description: data.description,
    requiredSkills: data.requiredSkills,
    eventType: data.eventType,
    category: data.category ?? null,
    dateTime: parsedDateUpdate,
    location: data.location,
    lat: data.lat ?? null,
    lng: data.lng ?? null,
    volunteersNeeded: data.volunteersNeeded,
    isUrgent: data.isUrgent,
    paymentAmount: data.paymentAmount ?? null,
  }).where(eq(eventsTable.id, eventId)).returning();

  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);

  res.json({
    ...updated,
    organizerName: organizer?.organizationName ?? "Unknown",
    organizerType: organizer?.organizationType ?? "NGO",
  });
});

router.delete("/:id", requireAuth, requireRole("organizer"), async (req, res) => {
  const user = (req as any).user;
  const eventId = parseInt(req.params.id as string);

  if (isNaN(eventId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }

  const [existing] = await db.select().from(eventsTable).where(
    and(eq(eventsTable.id, eventId), eq(eventsTable.organizerId, user.profileId))
  ).limit(1);

  if (!existing) {
    res.status(403).json({ error: "Forbidden", message: "Event not found or not yours" });
    return;
  }

  await db.delete(applicationsTable).where(eq(applicationsTable.eventId, eventId));
  await db.delete(eventsTable).where(eq(eventsTable.id, eventId));

  res.json({ success: true, message: "Event deleted" });
});

export default router;
