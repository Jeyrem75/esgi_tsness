import {Mongoose, Model, isValidObjectId} from "mongoose";
import {Challenge, ChallengeDifficulty} from "../../../models";
import {challengeSchema} from "../schema";

export type CreateChallenge = Omit<Challenge, '_id' | 'createdAt' | 'updatedAt' | 'participants'>;

export class ChallengeService {
    readonly challengeModel: Model<Challenge>;

    constructor(public readonly connection: Mongoose) {
        this.challengeModel = connection.model('Challenge', challengeSchema());
    }

    async createChallenge(challenge: CreateChallenge): Promise<Challenge> {
        return this.challengeModel.create({...challenge, participants: []});
    }

    async getChallenges(filters?: {
        difficulty?: ChallengeDifficulty;
        gym?: string;
    }): Promise<Challenge[]> {
        const query = this.challengeModel.find(filters || {});
        return query
            .populate('creator', '-password')
            .populate('gym')
            .populate('exercises')
            .populate('participants', '-password');
    }

    async getChallengeById(challengeId: string): Promise<Challenge | null> {
        if(!isValidObjectId(challengeId)) {
            return null;
        }
        return this.challengeModel.findById(challengeId)
            .populate('creator', '-password')
            .populate('gym')
            .populate('exercises')
            .populate('participants', '-password');
    }

    async joinChallenge(challengeId: string, userId: string): Promise<Challenge | null> {
        if(!isValidObjectId(challengeId) || !isValidObjectId(userId)) {
            return null;
        }
        return this.challengeModel.findByIdAndUpdate(
            challengeId,
            {$addToSet: {participants: userId}},
            {new: true}
        ).populate('participants', '-password');
    }

    async getChallengesByCreator(creatorId: string): Promise<Challenge[]> {
        if(!isValidObjectId(creatorId)) {
            return [];
        }
        return this.challengeModel.find({creator: creatorId})
            .populate('gym')
            .populate('exercises')
            .populate('participants', '-password');
    }

    async getChallengesByParticipant(userId: string): Promise<Challenge[]> {
        if(!isValidObjectId(userId)) {
            return [];
        }
        return this.challengeModel.find({participants: userId})
            .populate('creator', '-password')
            .populate('gym')
            .populate('exercises');
    }
}