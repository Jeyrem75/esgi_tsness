import {Mongoose, Model, isValidObjectId} from "mongoose";
import {UserBadge} from "../../../models";
import {userBadgeSchema} from "../schema";

export type CreateUserBadge = Omit<UserBadge, '_id' | 'createdAt' | 'updatedAt'>;

export class UserBadgeService {
    readonly userBadgeModel: Model<UserBadge>;

    constructor(public readonly connection: Mongoose) {
        this.userBadgeModel = connection.model('UserBadge', userBadgeSchema());
    }

    async awardBadge(userBadge: CreateUserBadge): Promise<UserBadge> {
        const existingBadge = await this.userBadgeModel.findOne({
            user: userBadge.user,
            badge: userBadge.badge
        });

        if(existingBadge) {
            return existingBadge;
        }

        return this.userBadgeModel.create(userBadge);
    }

    async getUserBadges(userId: string): Promise<UserBadge[]> {
        if(!isValidObjectId(userId)) {
            return [];
        }
        return this.userBadgeModel.find({user: userId})
            .populate('badge')
            .populate('challenge')
            .sort({earnedDate: -1});
    }

    async checkBadgeEligibility(userId: string, badgeId: string): Promise<boolean> {
        if(!isValidObjectId(userId) || !isValidObjectId(badgeId)) {
            return false;
        }
        const existingBadge = await this.userBadgeModel.findOne({
            user: userId,
            badge: badgeId
        });
        return !existingBadge;
    }
}