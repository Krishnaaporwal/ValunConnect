import { Router, type IRouter } from "express";
import { db, usersTable, volunteersTable, organizersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, signToken, requireAuth } from "../lib/auth.js";
import { z } from "zod";

const router: IRouter = Router();

const volunteerSignupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  skills: z.array(z.string()).optional().default([]),
  interests: z.array(z.string()).optional().default([]),
  location: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const organizerSignupSchema = z.object({
  organizationName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  location: z.string().optional(),
  organizationType: z.enum(["NGO", "Government", "Private"]),
  ngoRegistrationNumber: z.string().optional(),
  govtType: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  role: z.enum(["volunteer", "organizer"]),
});

router.post("/signup/volunteer", async (req, res) => {
  const parsed = volunteerSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { name, email, password, skills, interests, location, lat, lng } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(usersTable).values({ email, passwordHash, role: "volunteer" }).returning();

  const [volunteer] = await db.insert(volunteersTable).values({
    userId: user.id,
    name,
    location: location ?? null,
    lat: lat ?? null,
    lng: lng ?? null,
    skills,
    interests,
  }).returning();

  const token = signToken({ userId: user.id, role: "volunteer", profileId: volunteer.id });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: "volunteer", name: volunteer.name },
  });
});

router.post("/signup/organizer", async (req, res) => {
  const parsed = organizerSignupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { organizationName, email, password, location, organizationType, ngoRegistrationNumber, govtType, lat, lng } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db.insert(usersTable).values({ email, passwordHash, role: "organizer" }).returning();

  const [organizer] = await db.insert(organizersTable).values({
    userId: user.id,
    organizationName,
    location: location ?? null,
    lat: lat ?? null,
    lng: lng ?? null,
    organizationType,
    ngoRegistrationNumber: ngoRegistrationNumber ?? null,
    govtType: govtType ?? null,
    ngoVerified: false,
  }).returning();

  const token = signToken({ userId: user.id, role: "organizer", profileId: organizer.id });

  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: "organizer", name: organizationName },
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation error", message: parsed.error.message });
    return;
  }

  const { email, password, role } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.role !== role) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  let profileId: number;
  let name: string;

  if (role === "volunteer") {
    const [v] = await db.select().from(volunteersTable).where(eq(volunteersTable.userId, user.id)).limit(1);
    if (!v) {
      res.status(401).json({ error: "Unauthorized", message: "Profile not found" });
      return;
    }
    profileId = v.id;
    name = v.name;
  } else {
    const [o] = await db.select().from(organizersTable).where(eq(organizersTable.userId, user.id)).limit(1);
    if (!o) {
      res.status(401).json({ error: "Unauthorized", message: "Profile not found" });
      return;
    }
    profileId = o.id;
    name = o.organizationName;
  }

  const token = signToken({ userId: user.id, role, profileId });

  res.json({
    token,
    user: { id: user.id, email: user.email, role, name },
  });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.userId)).limit(1);
  if (!dbUser) {
    res.status(404).json({ error: "Not found", message: "User not found" });
    return;
  }

  let name: string;
  if (user.role === "volunteer") {
    const [v] = await db.select().from(volunteersTable).where(eq(volunteersTable.userId, user.userId)).limit(1);
    name = v?.name ?? "Volunteer";
  } else {
    const [o] = await db.select().from(organizersTable).where(eq(organizersTable.userId, user.userId)).limit(1);
    name = o?.organizationName ?? "Organizer";
  }

  const token = signToken({ userId: user.userId, role: user.role, profileId: user.profileId });

  res.json({
    token,
    user: { id: dbUser.id, email: dbUser.email, role: user.role, name },
  });
});

export default router;
