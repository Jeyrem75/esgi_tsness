"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutSessionSchema = workoutSessionSchema;
const mongoose_1 = require("mongoose");
function workoutSessionSchema() {
    return new mongoose_1.Schema({
        user: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        challenge: {
            type: mongoose_1.Schema.Types.ObjectId,
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
