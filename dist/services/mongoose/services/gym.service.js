"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GymService = void 0;
const mongoose_1 = require("mongoose");
const models_1 = require("../../../models");
const schema_1 = require("../schema");
class GymService {
    constructor(connection) {
        this.connection = connection;
        this.gymModel = connection.model('Gym', (0, schema_1.gymSchema)());
    }
    createGym(gym) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.gymModel.create(gym);
        });
    }
    getGyms(status) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = status ? { status } : {};
            return this.gymModel.find(filter).populate('owner', '-password');
        });
    }
    getGymById(gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(gymId)) {
                return null;
            }
            return this.gymModel.findById(gymId).populate('owner', '-password');
        });
    }
    updateGym(gymId, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(gymId)) {
                return null;
            }
            return this.gymModel.findByIdAndUpdate(gymId, updates, { new: true })
                .populate('owner', '-password');
        });
    }
    deleteGym(gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(gymId)) {
                return;
            }
            yield this.gymModel.deleteOne({ _id: gymId });
        });
    }
    approveGym(gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateGym(gymId, { status: models_1.GymStatus.APPROVED });
        });
    }
    rejectGym(gymId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.updateGym(gymId, { status: models_1.GymStatus.REJECTED });
        });
    }
}
exports.GymService = GymService;
