
import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import savedPlaceRoutes from "./routes/savedPlaceRoutes.js";
import diaryRoutes from "./routes/diaryRoutes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ message: "Welcome to ROAM API" });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/places", placeRoutes);
app.use("/api/saved-places", savedPlaceRoutes);
app.use("/api/diaries", diaryRoutes);

export default app;