import {Schema} from "mongoose";
import {Challenge, ChallengeDifficulty} from "../../../models";

export function challengeSchema(): Schema<Challenge> {
    return new Schema<Challenge>({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        difficulty: {
            type: String,
            enum: Object.values(ChallengeDifficulty),
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        exercises: [{
            type: Schema.Types.ObjectId,
            ref: 'Exercise'
        }],
        gym: {
            type: Schema.Types.ObjectId,
            ref: 'Gym'
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }],
        isActive: {
            type: Boolean,
            default: true
        }
    }, {
        timestamps: true,
        collection: "challenges",
        versionKey: false,
    });
}