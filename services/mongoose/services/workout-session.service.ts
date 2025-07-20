import {Mongoose, Model, isValidObjectId} from "mongoose";
import {WorkoutSession} from "../../../models";
import {workoutSessionSchema} from "../schema";

export type CreateWorkoutSession = Omit<WorkoutSession, '_id' | 'createdAt' | 'updatedAt'>;

export class WorkoutSessionService {
    readonly workoutSessionModel: Model<WorkoutSession>;

    constructor(public readonly connection: Mongoose) {
        this.workoutSessionModel = connection.model('WorkoutSession', workoutSessionSchema());
    }

    async createWorkoutSession(session: CreateWorkoutSession): Promise<WorkoutSession> {
        return this.workoutSessionModel.create(session);
    }

    async getWorkoutSessions(userId: string, challengeId?: string): Promise<WorkoutSession[]> {
        const filter: any = {};
        if(userId && isValidObjectId(userId)) {
            filter.user = userId;
        }
        if(challengeId && isValidObjectId(challengeId)) {
            filter.challenge = challengeId;
        }
        return this.workoutSessionModel.find(filter)
            .populate('user', '-password')
            .populate('challenge')
            .sort({date: -1});
    }

    async getUserStats(userId: string): Promise<{
        totalSessions: number;
        totalCalories: number;
        totalDuration: number;
        averageCaloriesPerSession: number;
    }> {
        if(!isValidObjectId(userId)) {
            return {totalSessions: 0, totalCalories: 0, totalDuration: 0, averageCaloriesPerSession: 0};
        }

        const stats = await this.workoutSessionModel.aggregate([
            {$match: {user: userId}},
            {
                $group: {
                    _id: null,
                    totalSessions: {$sum: 1},
                    totalCalories: {$sum: '$caloriesBurned'},
                    totalDuration: {$sum: '$duration'}
                }
            }
        ]);

        if(stats.length === 0) {
            return {totalSessions: 0, totalCalories: 0, totalDuration: 0, averageCaloriesPerSession: 0};
        }

        const result = stats[0];
        return {
            ...result,
            averageCaloriesPerSession: result.totalSessions > 0 ? result.totalCalories / result.totalSessions : 0
        };
    }

    async getTopActiveUsers(limit: number = 10): Promise<any[]> {
        return this.workoutSessionModel.aggregate([
            {
                $group: {
                    _id: '$user',
                    totalSessions: {$sum: 1},
                    totalCalories: {$sum: '$caloriesBurned'},
                    totalDuration: {$sum: '$duration'}
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
                $sort: {totalSessions: -1, totalCalories: -1}
            },
            {
                $limit: limit
            }
        ]);
    }
}