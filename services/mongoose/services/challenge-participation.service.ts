import {Mongoose, Model, isValidObjectId} from "mongoose";
import {ChallengeParticipation, ParticipationStatus} from "../../../models";
import {challengeParticipationSchema} from "../schema";

export type CreateChallengeParticipation = Omit<ChallengeParticipation, '_id' | 'createdAt' | 'updatedAt'>;

export class ChallengeParticipationService {
    readonly participationModel: Model<ChallengeParticipation>;

    constructor(public readonly connection: Mongoose) {
        this.participationModel = connection.model('ChallengeParticipation', challengeParticipationSchema());
    }

    async createParticipation(participation: CreateChallengeParticipation): Promise<ChallengeParticipation> {
        return this.participationModel.create(participation);
    }

    async getParticipation(userId: string, challengeId: string): Promise<ChallengeParticipation | null> {
        if(!isValidObjectId(userId) || !isValidObjectId(challengeId)) {
            return null;
        }
        return this.participationModel.findOne({user: userId, challenge: challengeId})
            .populate('user', '-password')
            .populate('challenge')
            .populate('badgesEarned');
    }

    async updateProgress(userId: string, challengeId: string, progressUpdate: {
        sessionsCompleted?: number;
        totalCaloriesBurned?: number;
        completionPercentage?: number;
    }): Promise<ChallengeParticipation | null> {
        if(!isValidObjectId(userId) || !isValidObjectId(challengeId)) {
            return null;
        }

        const updateQuery: any = {};
        if(progressUpdate.sessionsCompleted !== undefined) {
            updateQuery['progress.sessionsCompleted'] = progressUpdate.sessionsCompleted;
        }
        if(progressUpdate.totalCaloriesBurned !== undefined) {
            updateQuery['progress.totalCaloriesBurned'] = progressUpdate.totalCaloriesBurned;
        }
        if(progressUpdate.completionPercentage !== undefined) {
            updateQuery['progress.completionPercentage'] = progressUpdate.completionPercentage;
        }

        return this.participationModel.findOneAndUpdate(
            {user: userId, challenge: challengeId},
            {$set: updateQuery},
            {new: true}
        ).populate('challenge');
    }

    async getUserCompletedChallenges(userId: string): Promise<number> {
        if(!isValidObjectId(userId)) {
            return 0;
        }
        return this.participationModel.countDocuments({
            user: userId,
            status: ParticipationStatus.COMPLETED
        });
    }

    async completeParticipation(userId: string, challengeId: string): Promise<ChallengeParticipation | null> {
        return this.participationModel.findOneAndUpdate(
            {user: userId, challenge: challengeId},
            {
                status: ParticipationStatus.COMPLETED,
                completionDate: new Date(),
                'progress.completionPercentage': 100
            },
            {new: true}
        ).populate('challenge').populate('badgesEarned');
    }
}