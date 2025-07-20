import {Schema} from "mongoose";
import {Exercise, ExerciseDifficulty, ExerciseType} from "../../../models";

export function exerciseSchema(): Schema<Exercise> {
    return new Schema<Exercise>({
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
            enum: Object.values(ExerciseType),
            required: true
        },
        targetMuscles: [{
            type: String,
            required: true
        }],
        difficulty: {
            type: String,
            enum: Object.values(ExerciseDifficulty),
            required: true
        }
    }, {
        timestamps: true,
        collection: "exercises",
        versionKey: false,
    });
}