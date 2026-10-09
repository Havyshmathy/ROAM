
import prisma from "../config/database.js";

export async function getSavedPlaces(req, res) {
  try {
    const savedPlaces = await prisma.savedPlace.findMany({
      where: { userId: req.userId },
      include: { place: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, savedPlaces });
  } catch (error) {
    console.error("Get saved places error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load saved places.",
    });
  }
}

export async function savePlace(req, res) {
  try {
    const { placeId } = req.body;

    if (typeof placeId !== "string" || !placeId.trim()) {
      return res.status(400).json({
        success: false,
        message: "A place ID is required.",
      });
    }

    const place = await prisma.place.findUnique({
      where: { id: placeId },
      select: { id: true },
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found.",
      });
    }

    const savedPlace = await prisma.savedPlace.upsert({
      where: {
        userId_placeId: {
          userId: req.userId,
          placeId,
        },
      },
      update: {},
      create: {
        userId: req.userId,
        placeId,
      },
      include: { place: true },
    });

    return res.status(201).json({ success: true, savedPlace });
  } catch (error) {
    console.error("Save place error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save place.",
    });
  }
}

export async function unsavePlace(req, res) {
  try {
    const result = await prisma.savedPlace.deleteMany({
      where: {
        userId: req.userId,
        placeId: req.params.placeId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "This place is not in your saved list.",
      });
    }

    return res.json({
      success: true,
      message: "Place removed from saved places.",
    });
  } catch (error) {
    console.error("Unsave place error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not remove saved place.",
    });
  }
}