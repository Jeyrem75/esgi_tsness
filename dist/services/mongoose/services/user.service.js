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
exports.UserService = void 0;
const mongoose_1 = require("mongoose");
const schema_1 = require("../schema");
const utils_1 = require("../../../utils");
class UserService {
    constructor(connection) {
        this.connection = connection;
        this.userModel = connection.model('User', (0, schema_1.userSchema)());
    }
    findUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = { email: email, isActive: true };
            if (password) {
                filter.password = (0, utils_1.sha256)(password);
            }
            return this.userModel.findOne(filter);
        });
    }
    findUserById(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return null;
            }
            return this.userModel.findById(userId);
        });
    }
    createUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userModel.create(Object.assign(Object.assign({}, user), { password: (0, utils_1.sha256)(user.password) }));
        });
    }
    deactivateUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return;
            }
            yield this.userModel.updateOne({
                _id: userId
            }, {
                isActive: false
            });
        });
    }
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return;
            }
            yield this.userModel.deleteOne({ _id: userId });
        });
    }
    updateScore(userId, scoreIncrement) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                return;
            }
            yield this.userModel.updateOne({
                _id: userId
            }, {
                $inc: { score: scoreIncrement }
            });
        });
    }
    getLeaderboard() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            return this.userModel.find({
                isActive: true
            })
                .sort({ score: -1 })
                .limit(limit)
                .select('-password');
        });
    }
}
exports.UserService = UserService;
