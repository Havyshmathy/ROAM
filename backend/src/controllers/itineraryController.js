
import prisma from "../config/database.js";

function validDate(value) {
  return value == null || value === "" ||
    (typeof value === "string" && !Number.isNaN(Date.parse(value)));
}

export async function getItinerary(req, res) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.userId },
      select: { id: true },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const stops = await prisma.itineraryStop.findMany({
      where: { tripId: trip.id },
      include: { place: true },
      orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
    });

    return res.json({ success: true, stops });
  } catch (error) {
    console.error("Get itinerary error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load itinerary.",
    });
  }
}

export async function addItineraryStop(req, res) {
  try {
    const {
      title,
      description,
      visitDate,
      dayNumber,
      position,
      placeId,
    } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Stop title is required.",
      });
    }

    if (
      !validDate(visitDate) ||
      (dayNumber !== undefined &&
        (!Number.isInteger(dayNumber) || dayNumber < 1)) ||
      (position !== undefined &&
        (!Number.isInteger(position) || position < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Check the visit date, day number, and position.",
      });
    }

    const trip = await prisma.trip.findFirst({
      where: { id: req.params.tripId, userId: req.userId },
      select: { id: true },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    if (placeId !== undefined && placeId !== null) {
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { id: true },
      });

      if (!place) {
        return res.status(400).json({
          success: false,
          message: "Place not found.",
        });
      }
    }

    const stop = await prisma.itineraryStop.create({
      data: {
        tripId: trip.id,
        title: title.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        visitDate: visitDate ? new Date(visitDate) : null,
        dayNumber: dayNumber ?? 1,
        position: position ?? 0,
        placeId: placeId ?? null,
      },
      include: { place: true },
    });

    return res.status(201).json({ success: true, stop });
  } catch (error) {
    console.error("Add itinerary stop error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not add itinerary stop.",
    });
  }
}

export async function updateItineraryStop(req, res) {
  try {
    const stop = await prisma.itineraryStop.findFirst({
      where: {
        id: req.params.stopId,
        tripId: req.params.tripId,
        trip: { userId: req.userId },
      },
    });

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Itinerary stop not found.",
      });
    }

    const {
      title,
      description,
      visitDate,
      dayNumber,
      position,
      placeId,
    } = req.body;

    if (
      (title !== undefined &&
        (typeof title !== "string" || !title.trim())) ||
      (visitDate !== undefined && !validDate(visitDate)) ||
      (dayNumber !== undefined &&
        (!Number.isInteger(dayNumber) || dayNumber < 1)) ||
      (position !== undefined &&
        (!Number.isInteger(position) || position < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Check the supplied stop details.",
      });
    }

    if (description !== undefined &&
        description !== null &&
        typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description must be text.",
      });
    }

    if (placeId !== undefined && placeId !== null) {
      const place = await prisma.place.findUnique({
        where: { id: placeId },
        select: { id: true },
      });

      if (!place) {
        return res.status(400).json({
          success: false,
          message: "Place not found.",
        });
      }
    }

    const data = {};

    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) {
      data.description = typeof description === "string"
        ? description.trim() || null
        : null;
    }
    if (visitDate !== undefined) {
      data.visitDate = visitDate ? new Date(visitDate) : null;
    }
    if (dayNumber !== undefined) data.dayNumber = dayNumber;
    if (position !== undefined) data.position = position;
    if (placeId !== undefined) data.placeId = placeId;

    const updated = await prisma.itineraryStop.update({
      where: { id: stop.id },
      data,
      include: { place: true },
    });

    return res.json({ success: true, stop: updated });
  } catch (error) {
    console.error("Update itinerary stop error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update itinerary stop.",
    });
  }
}

export async function deleteItineraryStop(req, res) {
  try {
    const result = await prisma.itineraryStop.deleteMany({
      where: {
        id: req.params.stopId,
        tripId: req.params.tripId,
        trip: { userId: req.userId },
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Itinerary stop not found.",
      });
    }

    return res.json({
      success: true,
      message: "Itinerary stop deleted.",
    });
  } catch (error) {
    console.error("Delete itinerary stop error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not delete itinerary stop.",
    });
  }
}