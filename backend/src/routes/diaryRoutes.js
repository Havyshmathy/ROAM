
import { Router } from "express";
import {
  requireAuth,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import {
  getMyDiaries,
  getPublicDiaries,
  getDiaryById,
  createDiary,
  updateDiary,
  deleteDiary,
} from "../controllers/diaryController.js";

const router = Router();

// Public community feed.
router.get("/public", getPublicDiaries);

// Diary details: public posts are readable by anyone;
// private posts are readable only by their author.
router.get("/:id", optionalAuth, getDiaryById);

// Personal diary operations.
router.get("/", requireAuth, getMyDiaries);
router.post("/", requireAuth, createDiary);
router.put("/:id", requireAuth, updateDiary);
router.delete("/:id", requireAuth, deleteDiary);

export default router;