"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.challengeParticipationSchema = challengeParticipationSchema;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
function challengeParticipationSchema() {
    return new mongoose_1.Schema({
        user: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        challenge: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Challenge',
            required: true
        },
        status: {
            type: String,
            enum: Object.values(models_1.ParticipationStatus),
            default: models_1.ParticipationStatus.ACTIVE
        },
        progress: {
            sessionsCompleted: {
                type: Number,
                default: 0
            },
            totalCaloriesBurned: {
                type: Number,
                default: 0
            },
            completionPercentage: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },
        startDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        completionDate: {
            type: Date
        },
        badgesEarned: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Badge'
            }]
    }, {
        timestamps: true,
        collection: "challenge_participations",
        versionKey: false,
    });
}
