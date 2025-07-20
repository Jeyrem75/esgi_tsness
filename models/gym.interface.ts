import {Timestamps} from "./timestamps";
import {Address} from "./address.interface";
import {User} from "./user.interface";

export enum GymStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface Gym extends Timestamps {
    _id: string;
    name: string;
    description: string;
    address: Address;
    phone?: string;
    equipment: string[];
    activities: string[];
    capacity: number;
    owner: string | User;
    status: GymStatus;
}
