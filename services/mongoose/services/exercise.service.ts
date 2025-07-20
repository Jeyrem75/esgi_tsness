import {Mongoose, Model, isValidObjectId} from "mongoose";
import {Exercise} from "../../../models";
import {exerciseSchema} from "../schema";

export type CreateExercise = Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>;

export class ExerciseService {
    readonly exerciseModel: Model<Exercise>;

    constructor(public readonly connection: Mongoose) {
        this.exerciseModel = connection.model('Exercise', exerciseSchema());
    }

    async createExercise(exercise: CreateExercise): Promise<Exercise> {
        return this.exerciseModel.create(exercise);
    }

    async getExercises(): Promise<Exercise[]> {
        return this.exerciseModel.find();
    }

    async getExerciseById(exerciseId: string): Promise<Exercise | null> {
        if(!isValidObjectId(exerciseId)) {
            return null;
        }
        return this.exerciseModel.findById(exerciseId);
    }

    async updateExercise(exerciseId: string, updates: Partial<Exercise>): Promise<Exercise | null> {
        if(!isValidObjectId(exerciseId)) {
            return null;
        }
        return this.exerciseModel.findByIdAndUpdate(exerciseId, updates, {new: true});
    }

    async deleteExercise(exerciseId: string): Promise<void> {
        if(!isValidObjectId(exerciseId)) {
            return;
        }
        await this.exerciseModel.deleteOne({_id: exerciseId});
    }
}