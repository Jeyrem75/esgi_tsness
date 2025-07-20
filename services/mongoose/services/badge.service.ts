import {Mongoose, Model, isValidObjectId} from "mongoose";
import {Badge} from "../../../models";
import {badgeSchema} from "../schema";

export type CreateBadge = Omit<Badge, '_id' | 'createdAt' | 'updatedAt'>;

export class BadgeService {
    readonly badgeModel: Model<Badge>;

    constructor(public readonly connection: Mongoose) {
        this.badgeModel = connection.model('Badge', badgeSchema());
    }

    async createBadge(badge: CreateBadge): Promise<Badge> {
        return this.badgeModel.create(badge);
    }

    async getBadges(isActive?: boolean): Promise<Badge[]> {
        const filter = isActive !== undefined ? {isActive} : {};
        return this.badgeModel.find(filter);
    }

    async getBadgeById(badgeId: string): Promise<Badge | null> {
        if(!isValidObjectId(badgeId)) {
            return null;
        }
        return this.badgeModel.findById(badgeId);
    }
}
