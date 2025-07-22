"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userBadgeSchema = userBadgeSchema;
const mongoose_1 = require("mongoose");
function userBadgeSchema() {
    return new mongoose_1.Schema({
        user: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        badge: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Badge',
            required: true
        },
        earnedDate: {
            type: Date,
            required: true,
            default: Date.now
        },
        challenge: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Challenge'
        }
    }, {
        timestamps: true,
        collection: "user_badges",
        versionKey: false,
    });
}
