
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getSavedPlaces,
  savePlace,
  unsavePlace,
} from "../controllers/savedPlaceController.js";

const router = Router();

router.use(requireAuth);

router.get("/", getSavedPlaces);
router.post("/", savePlace);
router.delete("/:placeId", unsavePlace);

export default router;