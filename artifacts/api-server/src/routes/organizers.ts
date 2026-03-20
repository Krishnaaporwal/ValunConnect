import { Router, type IRouter } from "express";
import { db, organizersTable, eventsTable, applicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.use(requireAuth);
router.use(requireRole("organizer"));

router.get("/profile", async (req, res) => {
  const user = (req as any).user;
  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);

  if (!organizer) {
    res.status(404).json({ error: "Not found", message: "Organizer not found" });
    return;
  }

  res.json({
    id: organizer.id,
    organizationName: organizer.organizationName,
    email: "",
    location: organizer.location,
    organizationType: organizer.organizationType,
    ngoVerified: organizer.ngoVerified,
    ngoRegistrationNumber: organizer.ngoRegistrationNumber,
    createdAt: organizer.createdAt,
  });
});

router.get("/events", async (req, res) => {
  const user = (req as any).user;

  const events = await db.select().from(eventsTable).where(eq(eventsTable.organizerId, user.profileId));
  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);

  const result = events.map((event) => ({
    ...event,
    organizerName: organizer?.organizationName ?? "Unknown",
    organizerType: organizer?.organizationType ?? "NGO",
  }));

  res.json(result);
});

router.get("/stats", async (req, res) => {
  const user = (req as any).user;

  const events = await db.select().from(eventsTable).where(eq(eventsTable.organizerId, user.profileId));
  const eventIds = events.map((e) => e.id);

  let totalApplications = 0;
  let totalAccepted = 0;

  if (eventIds.length > 0) {
    for (const eventId of eventIds) {
      const apps = await db.select({ status: applicationsTable.status }).from(applicationsTable).where(eq(applicationsTable.eventId, eventId));
      totalApplications += apps.length;
      totalAccepted += apps.filter((a) => a.status === "accepted").length;
    }
  }

  const activeEvents = events.filter((e) => new Date(e.dateTime) > new Date()).length;

  res.json({
    totalEvents: events.length,
    activeEvents,
    totalApplications,
    totalAccepted,
    totalVolunteers: totalAccepted,
  });
});

const ngoVerifySchema = z.object({
  ngoRegistrationNumber: z.string().min(1),
});

router.post("/verify-ngo", async (req, res) => {
  const user = (req as any).user;
  const parsed = ngoVerifySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { ngoRegistrationNumber } = parsed.data;

  const [organizer] = await db.select().from(organizersTable).where(eq(organizersTable.id, user.profileId)).limit(1);
  if (!organizer) {
    res.status(404).json({ error: "Not found", message: "Organizer not found" });
    return;
  }

  const isValid = /^[A-Z0-9/-]{5,20}$/i.test(ngoRegistrationNumber);

  if (isValid) {
    await db.update(organizersTable).set({
      ngoRegistrationNumber,
      ngoVerified: true,
    }).where(eq(organizersTable.id, user.profileId));

    res.json({ verified: true, message: "NGO registration verified successfully" });
  } else {
    res.json({ verified: false, message: "Invalid NGO Darpan registration number format. Expected: alphanumeric, 5-20 chars." });
  }
});

export default router;
