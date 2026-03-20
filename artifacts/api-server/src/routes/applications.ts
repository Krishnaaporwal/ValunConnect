import { Router, type IRouter } from "express";
import { db, applicationsTable, eventsTable, volunteersTable, organizersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";
import { z } from "zod";

const router: IRouter = Router();

router.post("/", requireAuth, requireRole("volunteer"), async (req, res) => {
  const user = (req as any).user;
  const { eventId } = req.body;

  if (!eventId || isNaN(Number(eventId))) {
    res.status(400).json({ error: "Bad request", message: "Invalid eventId" });
    return;
  }

  const [existing] = await db
    .select()
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.volunteerId, user.profileId),
        eq(applicationsTable.eventId, Number(eventId))
      )
    )
    .limit(1);

  if (existing) {
    res.status(400).json({ error: "Already applied", message: "You have already applied to this event" });
    return;
  }

  const [app] = await db
    .insert(applicationsTable)
    .values({
      volunteerId: user.profileId,
      eventId: Number(eventId),
      status: "pending",
    })
    .returning();

  res.status(201).json(app);
});

router.get("/my", requireAuth, requireRole("volunteer"), async (req, res) => {
  const user = (req as any).user;

  const apps = await db
    .select()
    .from(applicationsTable)
    .where(eq(applicationsTable.volunteerId, user.profileId));

  const result = await Promise.all(
    apps.map(async (app) => {
      const [event] = await db.select().from(eventsTable).where(eq(eventsTable.id, app.eventId)).limit(1);
      const [organizer] = event
        ? await db.select().from(organizersTable).where(eq(organizersTable.id, event.organizerId)).limit(1).then(r => [r[0]])
        : [null];
      return {
        ...app,
        event: event
          ? {
              ...event,
              organizerName: organizer?.organizationName ?? "Unknown",
              organizerType: organizer?.organizationType ?? "NGO",
            }
          : null,
      };
    })
  );

  res.json(result);
});

router.put("/:id/status", requireAuth, requireRole("organizer"), async (req, res) => {
  const user = (req as any).user;
  const appId = parseInt(req.params.id);

  if (isNaN(appId)) {
    res.status(400).json({ error: "Bad request", message: "Invalid ID" });
    return;
  }

  const schema = z.object({ status: z.enum(["accepted", "rejected"]) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, appId)).limit(1);
  if (!app) {
    res.status(404).json({ error: "Not found", message: "Application not found" });
    return;
  }

  const [event] = await db.select().from(eventsTable).where(
    and(eq(eventsTable.id, app.eventId), eq(eventsTable.organizerId, user.profileId))
  ).limit(1);

  if (!event) {
    res.status(403).json({ error: "Forbidden", message: "Not your event" });
    return;
  }

  const [updated] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(applicationsTable.id, appId))
    .returning();

  if (parsed.data.status === "accepted" && app.status !== "accepted") {
    await db.update(eventsTable).set({
      volunteersAccepted: event.volunteersAccepted + 1,
    }).where(eq(eventsTable.id, event.id));

    const [volunteer] = await db.select().from(volunteersTable).where(eq(volunteersTable.id, app.volunteerId)).limit(1);
    if (volunteer) {
      await db.update(volunteersTable).set({
        eventsParticipated: volunteer.eventsParticipated + 1,
        totalHours: volunteer.totalHours + 4,
      }).where(eq(volunteersTable.id, volunteer.id));
    }
  }

  res.json(updated);
});

export default router;
