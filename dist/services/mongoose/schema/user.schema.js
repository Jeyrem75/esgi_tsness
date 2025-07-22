"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = userSchema;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
function userSchema() {
    return new mongoose_1.Schema({
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true,
            enum: Object.values(models_1.UserRole)
        },
        isActive: {
            type: Boolean,
            default: true
        },
        score: {
            type: Number,
            default: 0
        }
    }, {
        timestamps: true,
        collection: "users",
        versionKey: false,
    });
}
