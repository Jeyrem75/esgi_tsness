import {Mongoose, Model, isValidObjectId} from "mongoose";
import {Gym, GymStatus} from "../../../models";
import {gymSchema} from "../schema";

export type CreateGym = Omit<Gym, '_id' | 'createdAt' | 'updatedAt'>;

export class GymService {
    readonly gymModel: Model<Gym>;

    constructor(public readonly connection: Mongoose) {
        this.gymModel = connection.model('Gym', gymSchema());
    }

    async createGym(gym: CreateGym): Promise<Gym> {
        return this.gymModel.create(gym);
    }

    async getGyms(status?: GymStatus): Promise<Gym[]> {
        const filter = status ? {status} : {};
        return this.gymModel.find(filter).populate('owner', '-password');
    }

    async getGymById(gymId: string): Promise<Gym | null> {
        if(!isValidObjectId(gymId)) {
            return null;
        }
        return this.gymModel.findById(gymId).populate('owner', '-password');
    }

    async updateGym(gymId: string, updates: Partial<Gym>): Promise<Gym | null> {
        if(!isValidObjectId(gymId)) {
            return null;
        }
        return this.gymModel.findByIdAndUpdate(gymId, updates, {new: true})
            .populate('owner', '-password');
    }

    async deleteGym(gymId: string): Promise<void> {
        if(!isValidObjectId(gymId)) {
            return;
        }
        await this.gymModel.deleteOne({_id: gymId});
    }

    async approveGym(gymId: string): Promise<void> {
        await this.updateGym(gymId, {status: GymStatus.APPROVED});
    }

    async rejectGym(gymId: string): Promise<void> {
        await this.updateGym(gymId, {status: GymStatus.REJECTED});
    }
}