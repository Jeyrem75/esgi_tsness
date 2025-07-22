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
exports.WorkoutSessionService = void 0;
const mongoose_1 = require("mongoose");
const schema_1 = require("../schema");
class WorkoutSessionService {
    constructor(connection) {
        this.connection = connection;
        this.workoutSessionModel = connection.model('WorkoutSession', (0, schema_1.workoutSessionSchema)());
    }
    createWorkoutSession(session) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.workoutSessionModel.create(session);
        });
    }
    getWorkoutSessions(userId, challengeId) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {};
            if (userId && (0, mongoose_1.isValidObjectId)(userId)) {
                filter.user = userId;
            }
            if (challengeId && (0, mongoose_1.isValidObjectId)(challengeId)) {
                filter.challenge = challengeId;
            }
            return this.workoutSessionModel.find(filter)
                .populate('user', '-password')
                .populate('challenge')
                .sort({ date: -1 });
        });
    }
    getUserStats(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return { totalSessions: 0, totalCalories: 0, totalDuration: 0, averageCaloriesPerSession: 0 };
            }
            const stats = yield this.workoutSessionModel.aggregate([
                { $match: { user: userId } },
                {
                    $group: {
                        _id: null,
                        totalSessions: { $sum: 1 },
                        totalCalories: { $sum: '$caloriesBurned' },
                        totalDuration: { $sum: '$duration' }
                    }
                }
            ]);
            if (stats.length === 0) {
                return { totalSessions: 0, totalCalories: 0, totalDuration: 0, averageCaloriesPerSession: 0 };
            }
            const result = stats[0];
            return Object.assign(Object.assign({}, result), { averageCaloriesPerSession: result.totalSessions > 0 ? result.totalCalories / result.totalSessions : 0 });
        });
    }
    getTopActiveUsers() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return this.workoutSessionModel.aggregate([
                {
                    $group: {
                        _id: '$user',
                        totalSessions: { $sum: 1 },
                        totalCalories: { $sum: '$caloriesBurned' },
                        totalDuration: { $sum: '$duration' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        'user.firstName': 1,
                        'user.lastName': 1,
                        totalSessions: 1,
                        totalCalories: 1,
                        totalDuration: 1
                    }
                },
                {
                    $sort: { totalSessions: -1, totalCalories: -1 }
                },
                {
                    $limit: limit
                }
            ]);
        });
    }
}
exports.WorkoutSessionService = WorkoutSessionService;
