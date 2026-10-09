
import prisma from "../config/database.js";

const visibilityValues = ["PRIVATE", "PUBLIC"];

export async function getMyDiaries(req, res) {
  try {
    const diaries = await prisma.diaryEntry.findMany({
      where: { userId: req.userId },
      include: {
        trip: {
          select: { id: true, title: true, destination: true },
        },
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ success: true, diaries });
  } catch (error) {
    console.error("Get my diaries error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load your diaries.",
    });
  }
}

export async function getPublicDiaries(req, res) {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";

    const diaries = await prisma.diaryEntry.findMany({
      where: {
        visibility: "PUBLIC",
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
                { destination: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        content: true,
        destination: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true },
        },
        trip: {
          select: { id: true, title: true, destination: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return res.json({ success: true, diaries });
  } catch (error) {
    console.error("Get public diaries error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load public diaries.",
    });
  }
}

export async function getDiaryById(req, res) {
  try {
    const diary = await prisma.diaryEntry.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { userId: req.userId || "" },
          { visibility: "PUBLIC" },
        ],
      },
      select: {
        id: true,
        userId: true,
        title: true,
        content: true,
        destination: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true },
        },
        trip: {
          select: { id: true, title: true, destination: true },
        },
      },
    });

    if (!diary) {
      return res.status(404).json({
        success: false,
        message: "Diary not found.",
      });
    }

    // Only expose visibility and ownership details to the author.
    if (diary.userId !== req.userId) {
      delete diary.userId;
      delete diary.visibility;
    }

    return res.json({ success: true, diary });
  } catch (error) {
    console.error("Get diary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load this diary.",
    });
  }
}

export async function createDiary(req, res) {
  try {
    const { title, content, destination, tripId, visibility } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof content !== "string" || !content.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Diary title and content are required.",
      });
    }

    if (
      visibility !== undefined &&
      !visibilityValues.includes(visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be PRIVATE or PUBLIC.",
      });
    }

    if (
      destination !== undefined &&
      destination !== null &&
      typeof destination !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Destination must be text.",
      });
    }

    if (tripId !== undefined && tripId !== null) {
      if (typeof tripId !== "string" || !tripId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Trip ID must be a valid string.",
        });
      }

      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId: req.userId },
        select: { id: true },
      });

      if (!trip) {
        return res.status(400).json({
          success: false,
          message: "The linked trip was not found in your account.",
        });
      }
    }

    const diary = await prisma.diaryEntry.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        content: content.trim(),
        destination: destination?.trim() || null,
        tripId: tripId || null,
        visibility: visibility || "PRIVATE",
      },
      include: {
        user: { select: { id: true, name: true } },
        trip: { select: { id: true, title: true, destination: true } },
      },
    });

    return res.status(201).json({ success: true, diary });
  } catch (error) {
    console.error("Create diary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not create diary entry.",
    });
  }
}

export async function updateDiary(req, res) {
  try {
    const existing = await prisma.diaryEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Diary not found.",
      });
    }

    const { title, content, destination, tripId, visibility } = req.body;

    if (
      (title !== undefined &&
        (typeof title !== "string" || !title.trim())) ||
      (content !== undefined &&
        (typeof content !== "string" || !content.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and content cannot be empty.",
      });
    }

    if (
      visibility !== undefined &&
      !visibilityValues.includes(visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be PRIVATE or PUBLIC.",
      });
    }

    if (
      destination !== undefined &&
      destination !== null &&
      typeof destination !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Destination must be text.",
      });
    }

    if (tripId !== undefined && tripId !== null) {
      if (typeof tripId !== "string" || !tripId.trim()) {
        return res.status(400).json({
          success: false,
          message: "Trip ID must be a valid string or null.",
        });
      }

      const trip = await prisma.trip.findFirst({
        where: { id: tripId, userId: req.userId },
        select: { id: true },
      });

      if (!trip) {
        return res.status(400).json({
          success: false,
          message: "The linked trip was not found in your account.",
        });
      }
    }

    const data = {};

    if (title !== undefined) data.title = title.trim();
    if (content !== undefined) data.content = content.trim();
    if (destination !== undefined) {
      data.destination =
        typeof destination === "string" ? destination.trim() || null : null;
    }
    if (tripId !== undefined) data.tripId = tripId || null;
    if (visibility !== undefined) data.visibility = visibility;

    const diary = await prisma.diaryEntry.update({
      where: { id: existing.id },
      data,
      include: {
        user: { select: { id: true, name: true } },
        trip: { select: { id: true, title: true, destination: true } },
      },
    });

    return res.json({ success: true, diary });
  } catch (error) {
    console.error("Update diary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update diary entry.",
    });
  }
}

export async function deleteDiary(req, res) {
  try {
    const result = await prisma.diaryEntry.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Diary not found.",
      });
    }

    return res.json({
      success: true,
      message: "Diary entry deleted.",
    });
  } catch (error) {
    console.error("Delete diary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not delete diary entry.",
    });
  }
}