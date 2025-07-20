import {Mongoose, Model, FilterQuery, isValidObjectId} from "mongoose";
import {User, UserRole} from "../../../models";
import {userSchema} from "../schema";
import {sha256} from "../../../utils";

export type CreateUser = Omit<User, '_id' | 'createdAt' | 'updatedAt'>;

export class UserService {
    readonly userModel: Model<User>;

    constructor(public readonly connection: Mongoose) {
        this.userModel = connection.model('User', userSchema());
    }

    async findUser(email: string, password?: string): Promise<User | null> {
        const filter: FilterQuery<User> = {email: email, isActive: true};
        if(password) {
            filter.password = sha256(password);
        }
        return this.userModel.findOne(filter);
    }

    async findUserById(userId: string): Promise<User | null> {
        if(!isValidObjectId(userId)) {
            return null;
        }
        return this.userModel.findById(userId);
    }

    async createUser(user: CreateUser): Promise<User> {
        return this.userModel.create({...user, password: sha256(user.password)});
    }

    async deactivateUser(userId: string): Promise<void> {
        if(!isValidObjectId(userId)) {
            return;
        }
        await this.userModel.updateOne({
            _id: userId
        }, {
            isActive: false
        });
    }

    async deleteUser(userId: string): Promise<void> {
        if(!isValidObjectId(userId)) {
            return;
        }
        await this.userModel.deleteOne({_id: userId});
    }

    async updateScore(userId: string, scoreIncrement: number): Promise<void> {
        if(!isValidObjectId(userId)) {
            return;
        }
        await this.userModel.updateOne({
            _id: userId
        }, {
            $inc: { score: scoreIncrement }
        });
    }

    async getLeaderboard(limit: number = 10): Promise<User[]> {
        return this.userModel.find({
            isActive: true
        })
        .sort({score: -1})
        .limit(limit)
        .select('-password');
    }
}