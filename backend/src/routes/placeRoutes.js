
import { Router } from "express";
import {
  getPlaces,
  getPlaceById,
  createPlace,
} from "../controllers/placeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getPlaces);
router.get("/:id", getPlaceById);
router.post("/", requireAuth, createPlace);

export default router;