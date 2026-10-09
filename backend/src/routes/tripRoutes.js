
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
} from "../controllers/tripController.js";
import itineraryRoutes from "./itineraryRoutes.js";

const router = Router();

router.use(requireAuth);

router.get("/", getTrips);
router.post("/", createTrip);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);

router.use("/:tripId/itinerary", itineraryRoutes);

export default router;