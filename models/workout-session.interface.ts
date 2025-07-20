import {Timestamps} from "./timestamps";
import {User} from "./user.interface";
import {Challenge} from "./challenge.interface";

export interface WorkoutSession extends Timestamps {
    _id: string;
    user: string | User;
    challenge?: string | Challenge;
    date: Date;
    duration: number;
    caloriesBurned: number;
    notes?: string;
}
