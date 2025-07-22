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
exports.ChallengeController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class ChallengeController {
    constructor(challengeService, sessionService, participationService, userService) {
        this.challengeService = challengeService;
        this.sessionService = sessionService;
        this.participationService = participationService;
        this.userService = userService;
    }
    createChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.title || !req.body.description || !req.body.difficulty || !req.body.duration) {
                res.status(400).end();
                return;
            }
            if (!Object.values(models_1.ChallengeDifficulty).includes(req.body.difficulty)) {
                res.status(400).json({ error: 'Invalid difficulty' });
                return;
            }
            try {
                const challenge = yield this.challengeService.createChallenge({
                    title: req.body.title,
                    description: req.body.description,
                    difficulty: req.body.difficulty,
                    duration: req.body.duration,
                    exercises: req.body.exercises || [],
                    gym: req.body.gym,
                    creator: req.user._id,
                    isActive: true
                });
                yield this.userService.updateScore(req.user._id, 5);
                res.status(201).json(challenge);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to create challenge' });
            }
        });
    }
    getChallenges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const filters = {};
            if (req.query.difficulty)
                filters.difficulty = req.query.difficulty;
            if (req.query.gym)
                filters.gym = req.query.gym;
            const challenges = yield this.challengeService.getChallenges(filters);
            res.json(challenges);
        });
    }
    getChallengeById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const challengeId = req.params.id;
            const challenge = yield this.challengeService.getChallengeById(challengeId);
            if (!challenge) {
                res.status(404).end();
                return;
            }
            res.json(challenge);
        });
    }
    joinChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const challengeId = req.params.id;
            const userId = req.user._id;
            const challenge = yield this.challengeService.getChallengeById(challengeId);
            if (!challenge) {
                res.status(404).end();
                return;
            }
            const existingParticipation = yield this.participationService.getParticipation(userId, challengeId);
            if (existingParticipation) {
                res.status(409).json({ error: 'Already participating in this challenge' });
                return;
            }
            yield this.challengeService.joinChallenge(challengeId, userId);
            yield this.participationService.createParticipation({
                user: userId,
                challenge: challengeId,
                status: models_1.ParticipationStatus.ACTIVE,
                progress: {
                    sessionsCompleted: 0,
                    totalCaloriesBurned: 0,
                    completionPercentage: 0
                },
                startDate: new Date(),
                badgesEarned: []
            });
            res.status(200).json({ message: 'Successfully joined challenge' });
        });
    }
    inviteToChallenge(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const challengeId = req.params.id;
            const { userIds } = req.body;
            if (!userIds || !Array.isArray(userIds)) {
                res.status(400).json({ error: 'userIds array required' });
                return;
            }
            const challenge = yield this.challengeService.getChallengeById(challengeId);
            if (!challenge) {
                res.status(404).end();
                return;
            }
            if (challenge.creator.toString() !== req.user._id &&
                !challenge.participants.some(p => p.toString() === req.user._id)) {
                res.status(403).end();
                return;
            }
            for (const userId of userIds) {
                yield this.challengeService.joinChallenge(challengeId, userId);
                yield this.participationService.createParticipation({
                    user: userId,
                    challenge: challengeId,
                    status: models_1.ParticipationStatus.ACTIVE,
                    progress: {
                        sessionsCompleted: 0,
                        totalCaloriesBurned: 0,
                        completionPercentage: 0
                    },
                    startDate: new Date(),
                    badgesEarned: []
                });
            }
            res.status(200).json({ message: 'Users invited successfully' });
        });
    }
    getMyChallenges(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const challenges = yield this.challengeService.getChallengesByCreator(req.user._id);
            res.json(challenges);
        });
    }
    getMyParticipations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const challenges = yield this.challengeService.getChallengesByParticipant(req.user._id);
            res.json(challenges);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/', this.getChallenges.bind(this));
        router.get('/:id', this.getChallengeById.bind(this));
        router.post('/', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), (0, express_1.json)(), this.createChallenge.bind(this));
        router.get('/my/created', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.getMyChallenges.bind(this));
        router.get('/my/participations', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.getMyParticipations.bind(this));
        router.post('/:id/join', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.joinChallenge.bind(this));
        router.post('/:id/invite', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), (0, express_1.json)(), this.inviteToChallenge.bind(this));
        return router;
    }
}
exports.ChallengeController = ChallengeController;
