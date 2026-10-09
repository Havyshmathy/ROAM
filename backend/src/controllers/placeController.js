
import prisma from "../config/database.js";

export async function getPlaces(req, res) {
  try {
    const { search, category, country } = req.query;

    const places = await prisma.place.findMany({
      where: {
        ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
        ...(country ? { country: { equals: country, mode: "insensitive" } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { country: { contains: search, mode: "insensitive" } },
                { region: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { name: "asc" },
      take: 100,
    });

    return res.json({ success: true, places });
  } catch (error) {
    console.error("Get places error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load places.",
    });
  }
}

export async function getPlaceById(req, res) {
  try {
    const place = await prisma.place.findUnique({
      where: { id: req.params.id },
    });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found.",
      });
    }

    return res.json({ success: true, place });
  } catch (error) {
    console.error("Get place error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load this place.",
    });
  }
}

export async function createPlace(req, res) {
  try {
    const {
      name,
      country,
      region,
      description,
      imageUrl,
      category,
      latitude,
      longitude,
    } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Place name is required.",
      });
    }

    for (const coordinate of [latitude, longitude]) {
      if (
        coordinate !== undefined &&
        coordinate !== null &&
        (typeof coordinate !== "number" || !Number.isFinite(coordinate))
      ) {
        return res.status(400).json({
          success: false,
          message: "Coordinates must be valid numbers.",
        });
      }
    }

    if (
      (latitude != null && (latitude < -90 || latitude > 90)) ||
      (longitude != null && (longitude < -180 || longitude > 180))
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordinates are out of range.",
      });
    }

    const textFields = { country, region, description, imageUrl, category };
    for (const [field, value] of Object.entries(textFields)) {
      if (value !== undefined && value !== null && typeof value !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be text.`,
        });
      }
    }

    const place = await prisma.place.create({
      data: {
        name: name.trim(),
        country: country?.trim() || null,
        region: region?.trim() || null,
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
    });

    return res.status(201).json({ success: true, place });
  } catch (error) {
    console.error("Create place error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not create place.",
    });
  }
}