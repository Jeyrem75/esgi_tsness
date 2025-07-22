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
exports.BadgeController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class BadgeController {
    constructor(badgeService, sessionService, userBadgeService) {
        this.badgeService = badgeService;
        this.sessionService = sessionService;
        this.userBadgeService = userBadgeService;
    }
    createBadge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.name || !req.body.description || !req.body.rules) {
                res.status(400).end();
                return;
            }
            if (!req.body.rules.condition || req.body.rules.value === undefined) {
                res.status(400).json({ error: 'Invalid rules format' });
                return;
            }
            try {
                const badge = yield this.badgeService.createBadge({
                    name: req.body.name,
                    description: req.body.description,
                    rules: {
                        condition: req.body.rules.condition,
                        value: req.body.rules.value
                    },
                    isActive: true
                });
                res.status(201).json(badge);
            }
            catch (_a) {
                res.status(409).end();
            }
        });
    }
    getBadges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const badges = yield this.badgeService.getBadges(true);
            res.json(badges);
        });
    }
    getBadgeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const badgeId = req.params.id;
            const badge = yield this.badgeService.getBadgeById(badgeId);
            if (!badge) {
                res.status(404).end();
                return;
            }
            res.json(badge);
        });
    }
    getMyBadges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const userBadges = yield this.userBadgeService.getUserBadges(req.user._id);
            res.json(userBadges);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/', this.getBadges.bind(this));
        router.get('/:id', this.getBadgeById.bind(this));
        router.get('/my/badges', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.getMyBadges.bind(this));
        router.post('/', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), (0, express_1.json)(), this.createBadge.bind(this));
        return router;
    }
}
exports.BadgeController = BadgeController;
