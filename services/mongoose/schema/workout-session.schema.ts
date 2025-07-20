import {Schema} from "mongoose";
import {WorkoutSession} from "../../../models";

export function workoutSessionSchema(): Schema<WorkoutSession> {
    return new Schema<WorkoutSession>({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        challenge: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        caloriesBurned: {
            type: Number,
            required: true,
            min: 0
        },
        notes: {
            type: String
        }
    }, {
        timestamps: true,
        collection: "workout_sessions",
        versionKey: false,
    });
}