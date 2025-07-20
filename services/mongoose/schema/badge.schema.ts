import {Schema} from "mongoose";
import {Badge} from "../../../models";

export function badgeSchema(): Schema<Badge> {
    return new Schema<Badge>({
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