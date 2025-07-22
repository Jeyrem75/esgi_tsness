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
exports.ChallengeParticipationService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
const schema_1 = require("../schema");
class ChallengeParticipationService {
    constructor(connection) {
        this.connection = connection;
        this.participationModel = connection.model('ChallengeParticipation', (0, schema_1.challengeParticipationSchema)());
    }
    createParticipation(participation) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.participationModel.create(participation);
        });
    }
    getParticipation(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(challengeId)) {
                return null;
            }
            return this.participationModel.findOne({ user: userId, challenge: challengeId })
                .populate('user', '-password')
                .populate('challenge')
                .populate('badgesEarned');
        });
    }
    updateProgress(userId, challengeId, progressUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId) || !(0, mongoose_1.isValidObjectId)(challengeId)) {
                return null;
            }
            const updateQuery = {};
            if (progressUpdate.sessionsCompleted !== undefined) {
                updateQuery['progress.sessionsCompleted'] = progressUpdate.sessionsCompleted;
            }
            if (progressUpdate.totalCaloriesBurned !== undefined) {
                updateQuery['progress.totalCaloriesBurned'] = progressUpdate.totalCaloriesBurned;
            }
            if (progressUpdate.completionPercentage !== undefined) {
                updateQuery['progress.completionPercentage'] = progressUpdate.completionPercentage;
            }
            return this.participationModel.findOneAndUpdate({ user: userId, challenge: challengeId }, { $set: updateQuery }, { new: true }).populate('challenge');
        });
    }
    getUserCompletedChallenges(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return 0;
            }
            return this.participationModel.countDocuments({
                user: userId,
                status: models_1.ParticipationStatus.COMPLETED
            });
        });
    }
    completeParticipation(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.participationModel.findOneAndUpdate({ user: userId, challenge: challengeId }, {
                status: models_1.ParticipationStatus.COMPLETED,
                completionDate: new Date(),
                'progress.completionPercentage': 100
            }, { new: true }).populate('challenge').populate('badgesEarned');
        });
    }
}
exports.ChallengeParticipationService = ChallengeParticipationService;
