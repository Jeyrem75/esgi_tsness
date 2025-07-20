import {Timestamps} from "./timestamps";

export interface Badge extends Timestamps {
    _id: string;
    name: string;
    description: string;
    rules: {
        condition: string;
        value: number;
    };
    isActive: boolean;
}