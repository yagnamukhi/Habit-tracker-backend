import mongoose from "mongoose";

const habitSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    completedDates: [
        {
            type: Date
        }
    ]
}, { timestamps: true });

export const Habit = mongoose.model("Habit", habitSchema);