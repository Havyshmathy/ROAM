
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getItinerary,
  addItineraryStop,
  updateItineraryStop,
  deleteItineraryStop,
} from "../controllers/itineraryController.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get("/", getItinerary);
router.post("/", addItineraryStop);
router.put("/:stopId", updateItineraryStop);
router.delete("/:stopId", deleteItineraryStop);

export default router;