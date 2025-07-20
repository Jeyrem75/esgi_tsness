import {Schema} from "mongoose";
import {UserBadge} from "../../../models";

export function userBadgeSchema(): Schema<UserBadge> {
    return new Schema<UserBadge>({
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        badge: {
            type: Schema.Types.ObjectId,
            ref: 'Badge',
            required: true
        },
        earnedDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        challenge: {
            type: Schema.Types.ObjectId,
            ref: 'Challenge'
        }
    }, {
        timestamps: true,
        collection: "user_badges",
        versionKey: false,
    });
}