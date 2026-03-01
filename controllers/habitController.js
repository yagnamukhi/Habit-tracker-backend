import{ Habit } from "../models/Habits.js";
import { calculateCurrentStreak, calculateLongestStreak } from "../utils/streak.js";

export const createHabit = async (req, res) => { 
    const { title, description } = req.body;
    try {
        if(!title) {
            return res.status(400).json({ message: "Title is required" });
        }
        const habit = await Habit.create({
            title,
            description,
            user: req.user._id
        });
        res.status(201).json({ message: "Habit created successfully", data: habit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllHabits = async (req, res) => { 
    try {
        const habits = await Habit.find({ user: req.user._id });
        const result = habits.map(
            habit => {
                const currentStreak = calculateCurrentStreak(habit.completedDates);
                const longestStreak = calculateLongestStreak(habit.completedDates);

                // check completedToday value for frontend
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const completedToday = habit.completedDates.some(date => {
                    const d = new Date(date);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime() === today.getTime();
                });
                return {
                    ...habit.toObject(),
                    currentStreak,
                    longestStreak,
                    completedToday
                }
            }
        );
        res.status(200).json({ message: "Habits retrieved successfully", data: result });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


// Manual looping and checkimg dates to handle timezone issues and ensure date-only comparison
// export const markHabitComplete = async (req, res) => {
//     const habitID = req.params.id;
//     try {
//         const habit = await Habit.findOne({
//             _id: habitID,
//             user: req.user._id
//         });
//         if (!habit) {
//             return res.status(404).json({ message: "Habit not found" });
//         }
//         const currentDate = new Date();
//         currentDate.setHours(0, 0, 0, 0); // Normalize to midnight for date-only comparison
//         const index = habit.completedDates.findIndex(date => {
//             const d = new Date(date);
//             d.setHours(0, 0, 0, 0);
//             return d.getTime() === currentDate.getTime();
//         });
//         console.log("Current Date:", currentDate);
//         console.log("Completed Dates:", habit.completedDates);
//         console.log("Index of current date in completedDates:", index);
//         let message = "";
//         if (index === -1) {
//             habit.completedDates.push(currentDate);
//             message ="Habit marked as completed for today";
//         } else {
//             habit.completedDates.splice(index, 1);
//             message =  "Habit unmarked for today";
//         }
//         await habit.save();
//         res.status(200).json({message, habit});
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

// Using $addToSet and $pull for atomic operations to handle marking/unmarking completion
export const markHabitComplete = async (req, res) => {
    const habitID = req.params.id;
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Normalize to midnight for date-only comparison 
        const habit = await Habit.findOne({ _id: habitID, user: req.user._id });
        if (!habit) {
            return res.status(404).json({ message: "Habit not found" });
        }
        const isCompleted = habit.completedDates.some(date => date.getTime() === currentDate.getTime());
        const updateOperation = isCompleted ? { $pull: { completedDates: currentDate } } : { $addToSet: { completedDates: currentDate } };
        const message = isCompleted ? "Habit unmarked for today" : "Habit marked as completed for today";
        const updatedHabit = await Habit.findOneAndUpdate(
            { _id: habitID, user: req.user._id },
            updateOperation,
            { returnDocument: "after" }
        );
        res.status(200).json({ message, data: updatedHabit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const deleteHabit = async (req, res) => { 
    const habitID = req.params.id;
    try {
        const habit = await Habit.findOneAndDelete({ _id: habitID, user: req.user._id });
        if(!habit) {
            return res.status(404).json({ message: "Habit not found or unauthorized" });
        }
        res.status(200).json({ message: "Habit deleted successfully", data: habit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const updateHabit = async (req, res) => { 
    const habitID = req.params.id;
    const { title, description } = req.body;
    try {
        const habit = await Habit.findOneAndUpdate(
            { _id: habitID, user: req.user._id },
            { title, description },
            { returnDocument: "after" }
        );
        if(!habit) {
            return res.status(404).json({ message: "Habit not found or unauthorized" });
        }
        res.status(200).json({ message: "Habit updated successfully", data: habit });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}