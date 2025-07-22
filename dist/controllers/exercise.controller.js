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
exports.ExerciseController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class ExerciseController {
    constructor(exerciseService, sessionService) {
        this.exerciseService = exerciseService;
        this.sessionService = sessionService;
    }
    createExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.name || !req.body.description || !req.body.type || !req.body.targetMuscles || !req.body.difficulty) {
                res.status(400).end();
                return;
            }
            try {
                const exercise = yield this.exerciseService.createExercise({
                    name: req.body.name,
                    description: req.body.description,
                    type: req.body.type,
                    targetMuscles: req.body.targetMuscles,
                    difficulty: req.body.difficulty
                });
                res.status(201).json(exercise);
            }
            catch (_a) {
                res.status(409).end();
            }
        });
    }
    updateExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const exerciseId = req.params.id;
            const updatedExercise = yield this.exerciseService.updateExercise(exerciseId, req.body);
            if (!updatedExercise) {
                res.status(404).end();
                return;
            }
            res.json(updatedExercise);
        });
    }
    deleteExercise(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const exerciseId = req.params.id;
            yield this.exerciseService.deleteExercise(exerciseId);
            res.status(204).end();
        });
    }
    getExercises(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const exercises = yield this.exerciseService.getExercises();
            res.json(exercises);
        });
    }
    getExerciseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const exerciseId = req.params.id;
            const exercise = yield this.exerciseService.getExerciseById(exerciseId);
            if (!exercise) {
                res.status(404).end();
                return;
            }
            res.json(exercise);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/', this.getExercises.bind(this));
        router.get('/:id', this.getExerciseById.bind(this));
        router.post('/', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), (0, express_1.json)(), this.createExercise.bind(this));
        router.put('/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), (0, express_1.json)(), this.updateExercise.bind(this));
        router.delete('/:id', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.SUPER_ADMIN), this.deleteExercise.bind(this));
        return router;
    }
}
exports.ExerciseController = ExerciseController;
