import { Habit } from "../models/Habits.js";
import { calculateCurrentStreak, calculateLongestStreak } from "../utils/streak.js";

export const getHabitsStats = async (req, res) => { 
    try {
        const habits = await Habit.find({ user: req.user._id });
        // ===== 30 Day Heatmap Logic =====
        const heatmapMap = new Map();

        // Initialize last 30 days with 0 count
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const formatted = date.toISOString().split("T")[0];
            heatmapMap.set(formatted, 0);
        }

        // Count completions
        habits.forEach(habit => {
            habit.completedDates.forEach(date => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);

                const formatted = d.toISOString().split("T")[0];

                if (heatmapMap.has(formatted)) {
                    heatmapMap.set(
                        formatted,
                        heatmapMap.get(formatted) + 1
                    );
                }
            });
        });

        // Convert Map → Array
        const heatmap = Array.from(heatmapMap, ([date, count]) => ({
            date,
            count
        }));

        const totalHabits = habits.length;
        let totalCompletions = 0;
        let totalCompletedToday = 0;
        let activeStreaks = 0;
        let highestStreak = 0;
        let bestHabit = null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        habits.forEach(habit => {
            totalCompletions += habit.completedDates.length;
            const completedToday = habit.completedDates.some(date => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0);
                return d.getTime() === today.getTime();
            });
            if(completedToday) totalCompletedToday++;

            const currentStreak = calculateCurrentStreak(habit.completedDates);
            const longestStreak = calculateLongestStreak(habit.completedDates);
            if(currentStreak > 0) activeStreaks++;
            if(longestStreak > highestStreak) {
                highestStreak = longestStreak;
                bestHabit = habit.title;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalHabits,
                totalCompletions,
                totalCompletedToday,
                activeStreaks,
                highestStreak,
                bestHabit,
                heatmap
            },
            message: "Stats retrieved successfully"
        })
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// What stats to provide?
// 1. Total habits created
// 2. Total habits completed (can be based on completedDates length)
// 3. total Habits completed today (can be calculated by checking if today's date exists in completedDates for each habit and counting how many habits have it)
// 4. Active streak (can be calculated using the calculateCurrentStreak function for each habit and taking the maximum or average)
// 5. Highest streak (can be calculated using the calculateLongestStreak function for each habit and taking the maximum)
// 6. Best habit (can be determined by the habit with the longest current streak or longest overall streak)