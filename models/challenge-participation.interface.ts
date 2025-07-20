import {Timestamps} from "./timestamps";
import {User} from "./user.interface";
import {Challenge} from "./challenge.interface";

export enum ParticipationStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED'
}

export interface ChallengeParticipation extends Timestamps {
    _id: string;
    user: string | User;
    challenge: string | Challenge;
    status: ParticipationStatus;
    progress: {
        sessionsCompleted: number;
        totalCaloriesBurned: number;
        completionPercentage: number;
    };
    startDate: Date;
    completionDate?: Date;
    badgesEarned: string[];
}