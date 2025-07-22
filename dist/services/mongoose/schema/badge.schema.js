"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badgeSchema = badgeSchema;
const mongoose_1 = require("mongoose");
function badgeSchema() {
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
        rules: {
            condition: {
                type: String,
                required: true
            },
            value: {
                type: Number,
                required: true
            }
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }, {
        timestamps: true,
        collection: "badges",
        versionKey: false,
    });
}
