"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengeSchema = challengeSchema;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
function challengeSchema() {
    return new mongoose_1.Schema({
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
            enum: Object.values(models_1.ChallengeDifficulty),
            required: true
        },
        duration: {
            type: Number,
            required: true,
            min: 1
        },
        exercises: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Exercise'
            }],
        gym: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Gym'
        },
        creator: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [{
                type: mongoose_1.Schema.Types.ObjectId,
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
