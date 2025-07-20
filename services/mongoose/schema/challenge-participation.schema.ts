import {Schema} from "mongoose";
import {ChallengeParticipation, ParticipationStatus} from "../../../models";

export function challengeParticipationSchema(): Schema<ChallengeParticipation> {
    return new Schema<ChallengeParticipation>({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        challenge: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge',
            required: true
        },
        status: {
            type: String,
            enum: Object.values(ParticipationStatus),
            default: ParticipationStatus.ACTIVE
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
            type: Schema.Types.ObjectId,
            ref: 'Badge'
        }]
    }, {
        timestamps: true,
        collection: "challenge_participations",
        versionKey: false,
    });
}