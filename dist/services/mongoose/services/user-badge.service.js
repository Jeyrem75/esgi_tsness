"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBadgeService = void 0;
const mongoose_1 = require("mongoose");
const schema_1 = require("../schema");
class UserBadgeService {
    constructor(connection) {
        this.connection = connection;
        this.userBadgeModel = connection.model('UserBadge', (0, schema_1.userBadgeSchema)());
    }
    awardBadge(userBadge) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingBadge = yield this.userBadgeModel.findOne({
                user: userBadge.user,
                badge: userBadge.badge
            });
            if (existingBadge) {
                return existingBadge;
            }
            return this.userBadgeModel.create(userBadge);
        });
    }
    getUserBadges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return [];
            }
            return this.userBadgeModel.find({ user: userId })
                .populate('badge')
                .populate('challenge')
                .sort({ earnedDate: -1 });
        });
    }
    checkBadgeEligibility(userId, badgeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(badgeId)) {
                return false;
            }
            const existingBadge = yield this.userBadgeModel.findOne({
                user: userId,
                badge: badgeId
            });
            return !existingBadge;
        });
    }
}
exports.UserBadgeService = UserBadgeService;
