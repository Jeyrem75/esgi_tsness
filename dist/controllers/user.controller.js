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
exports.UserController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class UserController {
    constructor(userService, sessionService) {
        this.userService = userService;
        this.sessionService = sessionService;
    }
    deactivateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            yield this.userService.deactivateUser(userId);
            res.status(204).end();
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            yield this.userService.deleteUser(userId);
            res.status(204).end();
        });
    }
    deleteGymOwner(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = req.params.id;
            const user = yield this.userService.findUserById(userId);
            if (!user || user.role !== models_1.UserRole.GYM_OWNER) {
                res.status(404).end();
                return;
            }
            yield this.userService.deleteUser(userId);
            res.status(204).end();
        });
    }
    getLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const limit = parseInt(req.query.limit) || 10;
            const leaderboard = yield this.userService.getLeaderboard(limit);
            res.json(leaderboard);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/leaderboard', this.getLeaderboard.bind(this));
        router.patch('/:id/deactivate', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.deactivateUser.bind(this));
        router.delete('/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.deleteUser.bind(this));
        router.delete('/gym-owner/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.deleteGymOwner.bind(this));
        return router;
    }
}
exports.UserController = UserController;
