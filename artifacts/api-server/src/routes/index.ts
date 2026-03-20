import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import volunteersRouter from "./volunteers.js";
import eventsRouter from "./events.js";
import applicationsRouter from "./applications.js";
import organizersRouter from "./organizers.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/volunteers", volunteersRouter);
router.use("/events", eventsRouter);
router.use("/applications", applicationsRouter);
router.use("/organizers", organizersRouter);

export default router;
