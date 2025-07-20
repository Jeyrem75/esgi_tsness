import {Timestamps} from "./timestamps";
import {User} from "./user.interface";
import {Gym} from "./gym.interface";
import {Exercise} from "./exercise.interface";

export enum ChallengeDifficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD'
}

export interface Challenge extends Timestamps {
    _id: string;
    title: string;
    description: string;
    difficulty: ChallengeDifficulty;
    duration: number;
    exercises: string[] | Exercise[];
    gym?: string | Gym;
    creator: string | User;
    participants: string[] | User[];
    isActive: boolean;
}