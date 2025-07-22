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
exports.ChallengeService = void 0;
const mongoose_1 = require("mongoose");
const schema_1 = require("../schema");
class ChallengeService {
    constructor(connection) {
        this.connection = connection;
        this.challengeModel = connection.model('Challenge', (0, schema_1.challengeSchema)());
    }
    createChallenge(challenge) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.challengeModel.create(Object.assign(Object.assign({}, challenge), { participants: [] }));
        });
    }
    getChallenges(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = this.challengeModel.find(filters || {});
            return query
                .populate('creator', '-password')
                .populate('gym')
                .populate('exercises')
                .populate('participants', '-password');
        });
    }
    getChallengeById(challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(challengeId)) {
                return null;
            }
            return this.challengeModel.findById(challengeId)
                .populate('creator', '-password')
                .populate('gym')
                .populate('exercises')
                .populate('participants', '-password');
        });
    }
    joinChallenge(challengeId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(challengeId) || !(0, mongoose_1.isValidObjectId)(userId)) {
                return null;
            }
            return this.challengeModel.findByIdAndUpdate(challengeId, { $addToSet: { participants: userId } }, { new: true }).populate('participants', '-password');
        });
    }
    getChallengesByCreator(creatorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(creatorId)) {
                return [];
            }
            return this.challengeModel.find({ creator: creatorId })
                .populate('gym')
                .populate('exercises')
                .populate('participants', '-password');
        });
    }
    getChallengesByParticipant(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return [];
            }
            return this.challengeModel.find({ participants: userId })
                .populate('creator', '-password')
                .populate('gym')
                .populate('exercises');
        });
    }
}
exports.ChallengeService = ChallengeService;
