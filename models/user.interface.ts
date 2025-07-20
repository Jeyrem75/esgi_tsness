import {Timestamps} from "./timestamps";

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    GYM_OWNER = 'GYM_OWNER',
    CLIENT = 'CLIENT'
}

export function getUserRoleLevel(role: UserRole): number {
    switch (role) {
        case UserRole.SUPER_ADMIN:
            return 999;
        case UserRole.GYM_OWNER:
            return 100;
        case UserRole.CLIENT:
            return 1;
        default:
            return 0;
    }
}

export interface User extends Timestamps {
    _id: string;
    lastName: string;
    firstName: string;
    email: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    score: number;
}