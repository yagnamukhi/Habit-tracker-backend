import { Habit } from "../models/Habits.js";

export const getMonthlyHeatmap = async (req, res) => {
    try {
        const { month, year } = req.query;

        const selectedMonth = parseInt(month) - 1; // JS month is 0-based
        const selectedYear = parseInt(year);

        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0);

        startDate.setHours(0,0,0,0);
        endDate.setHours(23,59,59,999);

        const habits = await Habit.find({ user: req.user._id });

        const heatmapMap = new Map();

        // Initialize all days of month
        for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
        ) {
            // const dateStr = d.toISOString().split("T")[0];
            const dateStr = d.getFullYear() + "-" +
                String(d.getMonth() + 1).padStart(2, "0") + "-" +
                String(d.getDate()).padStart(2, "0");
            heatmapMap.set(dateStr, 0);
        }

        // Count completions
        habits.forEach(habit => {
            habit.completedDates.forEach(date => {
                const completed = new Date(date);

                if (completed >= startDate && completed <= endDate) {
                    completed.setHours(0,0,0,0);
                    // const formatted = completed.toISOString().split("T")[0];
                    const formatted = completed.getFullYear() + "-" +
                        String(completed.getMonth() + 1).padStart(2, "0") + "-" +
                        String(completed.getDate()).padStart(2, "0");
                    if (heatmapMap.has(formatted)) {
                        heatmapMap.set(
                            formatted,
                            heatmapMap.get(formatted) + 1
                        );
                    }
                }
            });
        });

        // Convert to array with intensity
        const heatmap = Array.from(heatmapMap, ([date, count]) => {
            let level = 0;
            if (count === 0) level = 0;
            else if (count === 1) level = 1;
            else if (count <= 3) level = 2;
            else if (count <= 5) level = 3;
            else level = 4;

            return { date, count, level };
        });

        res.status(200).json({
            success: true,
            data: heatmap
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};