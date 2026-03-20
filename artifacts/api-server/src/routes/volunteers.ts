import { Router, type IRouter } from "express";
import { db, volunteersTable, applicationsTable, eventsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);
router.use(requireRole("volunteer"));

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  bio: z.string().optional(),
  availability: z.string().optional(),
});

router.get("/profile", async (req, res) => {
  const user = (req as any).user;
  const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, user.profileId)).limit(1);

  if (!volunteer) {
    res.status(404).json({ error: "Not found", message: "Volunteer not found" });
    return;
  }

  res.json({
    id: volunteer.id,
    name: volunteer.name,
    email: "",
    location: volunteer.location,
    lat: volunteer.lat,
    lng: volunteer.lng,
    skills: volunteer.skills,
    interests: volunteer.interests,
    bio: volunteer.bio,
    availability: volunteer.availability,
    totalHours: volunteer.totalHours,
    eventsParticipated: volunteer.eventsParticipated,
    createdAt: volunteer.createdAt,
  });
});

router.put("/profile", async (req, res) => {
  const user = (req as any).user;
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const updateData: Record<string, any> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.skills !== undefined) updateData.skills = parsed.data.skills;
  if (parsed.data.interests !== undefined) updateData.interests = parsed.data.interests;
  if (parsed.data.location !== undefined) updateData.location = parsed.data.location;
  if (parsed.data.lat !== undefined) updateData.lat = parsed.data.lat;
  if (parsed.data.lng !== undefined) updateData.lng = parsed.data.lng;
  if (parsed.data.bio !== undefined) updateData.bio = parsed.data.bio;
  if (parsed.data.availability !== undefined) updateData.availability = parsed.data.availability;

  const [updated] = await db
    .update(volunteersTable)
    .set(updateData)
    .where(eq(volunteersTable.id, user.profileId))
    .returning();

  res.json({
    id: updated.id,
    name: updated.name,
    email: "",
    location: updated.location,
    lat: updated.lat,
    lng: updated.lng,
    skills: updated.skills,
    interests: updated.interests,
    bio: updated.bio,
    availability: updated.availability,
    totalHours: updated.totalHours,
    eventsParticipated: updated.eventsParticipated,
    createdAt: updated.createdAt,
  });
});

router.get("/stats", async (req, res) => {
  const user = (req as any).user;

  const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, user.profileId)).limit(1);
  if (!volunteer) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const apps = await db
    .select({ eventId: applicationsTable.eventId, status: applicationsTable.status })
    .from(applicationsTable)
    .where(eq(applicationsTable.volunteerId, user.profileId));

  const acceptedApps = apps.filter((a) => a.status === "accepted");

  const categoriesWorked: string[] = [];
  if (acceptedApps.length > 0) {
    for (const app of acceptedApps) {
      const [event] = await db.select({ category: eventsTable.category }).from(eventsTable).where(eq(eventsTable.id, app.eventId)).limit(1);
      if (event?.category) categoriesWorked.push(event.category);
    }
  }

  const upcomingEvents = apps.filter((a) => a.status === "accepted").length;

  res.json({
    totalHours: volunteer.totalHours,
    eventsParticipated: volunteer.eventsParticipated,
    categoriesWorked: [...new Set(categoriesWorked)],
    upcomingEvents,
  });
});

export default router;
