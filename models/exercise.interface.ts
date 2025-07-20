import {Timestamps} from "./timestamps";

export enum ExerciseDifficulty {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE', 
    ADVANCED = 'ADVANCED'
}

export enum ExerciseType {
    CARDIO = 'CARDIO',
    MUSCULATION = 'MUSCULATION',
    STRETCHING = 'STRETCHING'
}

export interface Exercise extends Timestamps {
    _id: string;
    name: string;
    description: string;
    type: ExerciseType;
    targetMuscles: string[];
    difficulty: ExerciseDifficulty;
}