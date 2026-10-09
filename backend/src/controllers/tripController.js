
import prisma from "../config/database.js";

function validOptionalDate(value) {
  return value == null || value === "" ||
    (typeof value === "string" && !Number.isNaN(Date.parse(value)));
}

function dateOrNull(value) {
  return value ? new Date(value) : null;
}

export async function getTrips(req, res) {
  try {
    const trips = await prisma.trip.findMany({
      where: { userId: req.userId },
      include: {
        itineraryStops: {
          orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
          include: { place: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ success: true, trips });
  } catch (error) {
    console.error("Get trips error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load trips.",
    });
  }
}

export async function getTripById(req, res) {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        itineraryStops: {
          orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
          include: { place: true },
        },
        diaryEntries: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.json({ success: true, trip });
  } catch (error) {
    console.error("Get trip error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load this trip.",
    });
  }
}

export async function createTrip(req, res) {
  try {
    const { title, destination, description, startDate, endDate } = req.body;

    if (
      typeof title !== "string" || !title.trim() ||
      typeof destination !== "string" || !destination.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Trip title and destination are required.",
      });
    }

    if (!validOptionalDate(startDate) || !validOptionalDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid date strings.",
      });
    }

    const start = dateOrNull(startDate);
    const end = dateOrNull(endDate);

    if (start && end && end < start) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const trip = await prisma.trip.create({
      data: {
        userId: req.userId,
        title: title.trim(),
        destination: destination.trim(),
        description:
          typeof description === "string" ? description.trim() || null : null,
        startDate: start,
        endDate: end,
      },
      include: { itineraryStops: true },
    });

    return res.status(201).json({ success: true, trip });
  } catch (error) {
    console.error("Create trip error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not create trip.",
    });
  }
}

export async function updateTrip(req, res) {
  try {
    const { title, destination, description, startDate, endDate } = req.body;

    const existingTrip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!existingTrip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    if (
      (title !== undefined && (typeof title !== "string" || !title.trim())) ||
      (destination !== undefined &&
        (typeof destination !== "string" || !destination.trim()))
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and destination cannot be empty.",
      });
    }

    if (
      (startDate !== undefined && !validOptionalDate(startDate)) ||
      (endDate !== undefined && !validOptionalDate(endDate))
    ) {
      return res.status(400).json({
        success: false,
        message: "Dates must be valid date strings.",
      });
    }

    const nextStart =
      startDate === undefined ? existingTrip.startDate : dateOrNull(startDate);
    const nextEnd =
      endDate === undefined ? existingTrip.endDate : dateOrNull(endDate);

    if (nextStart && nextEnd && nextEnd < nextStart) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const data = {};

    if (title !== undefined) data.title = title.trim();
    if (destination !== undefined) data.destination = destination.trim();

    if (description !== undefined) {
      if (description !== null && typeof description !== "string") {
        return res.status(400).json({
          success: false,
          message: "Description must be text.",
        });
      }
      data.description =
        typeof description === "string" ? description.trim() || null : null;
    }

    if (startDate !== undefined) data.startDate = dateOrNull(startDate);
    if (endDate !== undefined) data.endDate = dateOrNull(endDate);

    const trip = await prisma.trip.update({
      where: { id: existingTrip.id },
      data,
      include: {
        itineraryStops: {
          orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
        },
      },
    });

    return res.json({ success: true, trip });
  } catch (error) {
    console.error("Update trip error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update trip.",
    });
  }
}

export async function deleteTrip(req, res) {
  try {
    const result = await prisma.trip.deleteMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.json({
      success: true,
      message: "Trip deleted successfully.",
    });
  } catch (error) {
    console.error("Delete trip error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not delete trip.",
    });
  }
}