import {Timestamps} from "./timestamps";
import {User} from "./user.interface";
import {Badge} from "./badge.interface";

export interface UserBadge extends Timestamps {
    _id: string;
    user: string | User;
    badge: string | Badge;
    earnedDate: Date;
    challenge?: string; 
}