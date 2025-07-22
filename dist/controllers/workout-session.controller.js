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
exports.WorkoutSessionController = void 0;
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const models_1 = require("../models");
class WorkoutSessionController {
    constructor(workoutSessionService, sessionService, participationService, userBadgeService, badgeService, userService) {
        this.workoutSessionService = workoutSessionService;
        this.sessionService = sessionService;
        this.participationService = participationService;
        this.userBadgeService = userBadgeService;
        this.badgeService = badgeService;
        this.userService = userService;
    }
    createWorkoutSession(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.body || !req.body.duration || !req.body.caloriesBurned) {
                res.status(400).end();
                return;
            }
            try {
                const workoutSession = yield this.workoutSessionService.createWorkoutSession({
                    user: req.user._id,
                    challenge: req.body.challenge,
                    date: req.body.date ? new Date(req.body.date) : new Date(),
                    duration: req.body.duration,
                    caloriesBurned: req.body.caloriesBurned,
                    notes: req.body.notes
                });
                if (req.body.challenge) {
                    yield this.updateChallengeProgress(req.user._id, req.body.challenge, req.body.caloriesBurned);
                }
                yield this.checkBadgeEligibility(req.user._id);
                res.status(201).json(workoutSession);
            }
            catch (error) {
                res.status(500).json({ error: 'Failed to create workout session' });
            }
        });
    }
    updateChallengeProgress(userId, challengeId, caloriesBurned) {
        return __awaiter(this, void 0, void 0, function* () {
            const participation = yield this.participationService.getParticipation(userId, challengeId);
            if (participation && participation.status === 'ACTIVE') {
                const newSessionsCompleted = participation.progress.sessionsCompleted + 1;
                const newTotalCalories = participation.progress.totalCaloriesBurned + caloriesBurned;
                yield this.participationService.updateProgress(userId, challengeId, {
                    sessionsCompleted: newSessionsCompleted,
                    totalCaloriesBurned: newTotalCalories,
                    completionPercentage: Math.min(100, (newSessionsCompleted / 10) * 100)
                });
                yield this.userService.updateScore(userId, 2);
                if (newSessionsCompleted >= 10) {
                    yield this.userService.updateScore(userId, 20);
                    yield this.participationService.completeParticipation(userId, challengeId);
                }
            }
        });
    }
    checkBadgeEligibility(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.workoutSessionService.getUserStats(userId);
            const user = yield this.userService.findUserById(userId);
            const badges = yield this.badgeService.getBadges(true);
            for (const badge of badges) {
                const hasEligibility = yield this.userBadgeService.checkBadgeEligibility(userId, badge._id);
                if (!hasEligibility)
                    continue;
                let shouldAward = false;
                const condition = badge.rules.condition;
                const value = badge.rules.value;
                switch (condition) {
                    case 'sessionsCompleted':
                        shouldAward = stats.totalSessions >= value;
                        break;
                    case 'caloriesBurned':
                        shouldAward = stats.totalCalories >= value;
                        break;
                    case 'challengesCompleted':
                        const completedChallenges = yield this.participationService.getUserCompletedChallenges(userId);
                        shouldAward = completedChallenges >= value;
                        break;
                    case 'score':
                        shouldAward = ((user === null || user === void 0 ? void 0 : user.score) || 0) >= value;
                        break;
                }
                if (shouldAward) {
                    yield this.userBadgeService.awardBadge({
                        user: userId,
                        badge: badge._id,
                        earnedDate: new Date()
                    });
                }
            }
        });
    }
    getMyStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const stats = yield this.workoutSessionService.getUserStats(req.user._id);
            res.json(stats);
        });
    }
    getLeaderboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const leaderboard = yield this.userService.getLeaderboard(10);
            res.json(leaderboard);
        });
    }
    getMyWorkoutSessions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessions = yield this.workoutSessionService.getWorkoutSessions(req.user._id);
            res.json(sessions);
        });
    }
    buildRouter() {
        const router = (0, express_1.Router)();
        router.get('/leaderboard', this.getLeaderboard.bind(this));
        router.post('/', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), (0, express_1.json)(), this.createWorkoutSession.bind(this));
        router.get('/my/sessions', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.getMyWorkoutSessions.bind(this));
        router.get('/my/stats', (0, middlewares_1.sessionMiddleware)(this.sessionService), (0, middlewares_1.roleMiddleware)(models_1.UserRole.CLIENT), this.getMyStats.bind(this));
        return router;
    }
}
exports.WorkoutSessionController = WorkoutSessionController;
