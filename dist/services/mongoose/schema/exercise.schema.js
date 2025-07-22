"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exerciseSchema = exerciseSchema;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
function exerciseSchema() {
    return new mongoose_1.Schema({
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: Object.values(models_1.ExerciseType),
            required: true
        },
        targetMuscles: [{
                type: String,
                required: true
            }],
        difficulty: {
            type: String,
            enum: Object.values(models_1.ExerciseDifficulty),
            required: true
        }
    }, {
        timestamps: true,
        collection: "exercises",
        versionKey: false,
    });
}
