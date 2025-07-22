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
exports.GymController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class GymController {
    constructor(gymService, sessionService, userService) {
        this.gymService = gymService;
        this.sessionService = sessionService;
        this.userService = userService;
    }
    createGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.name || !req.body.description || !req.body.address || !req.body.capacity) {
                res.status(400).end();
                return;
            }
            const address = req.body.address;
            if (!address.street || !address.city || !address.zipCode) {
                res.status(400).end();
                return;
            }
            const gym = yield this.gymService.createGym({
                name: req.body.name,
                description: req.body.description,
                address: address,
                phone: req.body.phone,
                equipment: req.body.equipment || [],
                activities: req.body.activities || [],
                capacity: req.body.capacity,
                owner: req.user._id,
                status: models_1.GymStatus.PENDING
            });
            res.status(201).json(gym);
        });
    }
    updateMyGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            const gym = yield this.gymService.getGymById(gymId);
            if (!gym) {
                res.status(404).end();
                return;
            }
            if (gym.owner.toString() !== req.user._id) {
                res.status(403).end();
                return;
            }
            const updatedGym = yield this.gymService.updateGym(gymId, req.body);
            res.json(updatedGym);
        });
    }
    deleteMyGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            const gym = yield this.gymService.getGymById(gymId);
            if (!gym) {
                res.status(404).end();
                return;
            }
            if (gym.owner.toString() !== req.user._id) {
                res.status(403).end();
                return;
            }
            yield this.gymService.deleteGym(gymId);
            res.status(204).end();
        });
    }
    approveGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            yield this.gymService.approveGym(gymId);
            const gym = yield this.gymService.getGymById(gymId);
            if (gym) {
                yield this.userService.updateScore(gym.owner.toString(), 10);
            }
            res.status(204).end();
        });
    }
    rejectGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            yield this.gymService.rejectGym(gymId);
            res.status(204).end();
        });
    }
    adminCreateGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.name || !req.body.description || !req.body.address || !req.body.capacity || !req.body.owner) {
                res.status(400).end();
                return;
            }
            const gym = yield this.gymService.createGym(Object.assign(Object.assign({}, req.body), { status: models_1.GymStatus.APPROVED }));
            res.status(201).json(gym);
        });
    }
    adminUpdateGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            const updatedGym = yield this.gymService.updateGym(gymId, req.body);
            if (!updatedGym) {
                res.status(404).end();
                return;
            }
            res.json(updatedGym);
        });
    }
    adminDeleteGym(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            yield this.gymService.deleteGym(gymId);
            res.status(204).end();
        });
    }
    getGyms(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = req.query.status;
            const gyms = yield this.gymService.getGyms(status);
            res.json(gyms);
        });
    }
    getGymById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const gymId = req.params.id;
            const gym = yield this.gymService.getGymById(gymId);
            if (!gym) {
                res.status(404).end();
                return;
            }
            res.json(gym);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/', this.getGyms.bind(this));
        router.get('/:id', this.getGymById.bind(this));
        router.post('/', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.GYM_OWNER), (0, express_1.json)(), this.createGym.bind(this));
        router.put('/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.GYM_OWNER), (0, express_1.json)(), this.updateMyGym.bind(this));
        router.delete('/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.GYM_OWNER), this.deleteMyGym.bind(this));
        router.patch('/:id/approve', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.approveGym.bind(this));
        router.patch('/:id/reject', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.rejectGym.bind(this));
        router.post('/admin/create', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), (0, express_1.json)(), this.adminCreateGym.bind(this));
        router.put('/admin/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), (0, express_1.json)(), this.adminUpdateGym.bind(this));
        router.delete('/admin/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.adminDeleteGym.bind(this));
        return router;
    }
}
exports.GymController = GymController;
