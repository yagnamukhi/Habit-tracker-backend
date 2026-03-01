import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createHabit, getAllHabits, markHabitComplete, deleteHabit, updateHabit } from "../controllers/habitController.js";
import { getHabitsStats } from "../controllers/statsController.js";
import { getMonthlyHeatmap } from "../controllers/heatMapController.js";

const router = express.Router();

router.post("/", authMiddleware, createHabit);
router.get("/", authMiddleware, getAllHabits);
router.patch("/:id/complete", authMiddleware, markHabitComplete);
router.delete("/:id", authMiddleware, deleteHabit);
router.put("/:id", authMiddleware, updateHabit); 
router.get("/stats", authMiddleware, getHabitsStats); // New route for stats
router.get("/stats/monthly", authMiddleware, getMonthlyHeatmap); // New route for heatmap

export default router;