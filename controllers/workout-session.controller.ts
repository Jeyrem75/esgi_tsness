import {SessionService, WorkoutSessionService, ChallengeParticipationService, UserBadgeService, BadgeService, UserService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class WorkoutSessionController {
    constructor(
        public readonly workoutSessionService: WorkoutSessionService,
        public readonly sessionService: SessionService,
        public readonly participationService: ChallengeParticipationService,
        public readonly userBadgeService: UserBadgeService,
        public readonly badgeService: BadgeService,
        public readonly userService: UserService
    ) {}

    async createWorkoutSession(req: Request, res: Response) {
        if(!req.body || !req.body.duration || !req.body.caloriesBurned) {
            res.status(400).end();
            return;
        }

        try {
            const workoutSession = await this.workoutSessionService.createWorkoutSession({
                user: req.user!._id,
                challenge: req.body.challenge,
                date: req.body.date ? new Date(req.body.date) : new Date(),
                duration: req.body.duration,
                caloriesBurned: req.body.caloriesBurned,
                notes: req.body.notes
            });

            if(req.body.challenge) {
                await this.updateChallengeProgress(req.user!._id, req.body.challenge, req.body.caloriesBurned);
            }

            await this.checkBadgeEligibility(req.user!._id);

            res.status(201).json(workoutSession);
        } catch (error) {
            res.status(500).json({error: 'Failed to create workout session'});
        }
    }

    private async updateChallengeProgress(userId: string, challengeId: string, caloriesBurned: number) {
        const participation = await this.participationService.getParticipation(userId, challengeId);
        if(participation && participation.status === 'ACTIVE') {
            const newSessionsCompleted = participation.progress.sessionsCompleted + 1;
            const newTotalCalories = participation.progress.totalCaloriesBurned + caloriesBurned;
            
            await this.participationService.updateProgress(userId, challengeId, {
                sessionsCompleted: newSessionsCompleted,
                totalCaloriesBurned: newTotalCalories,
                completionPercentage: Math.min(100, (newSessionsCompleted / 10) * 100)
            });

            await this.userService.updateScore(userId, 2);

            if(newSessionsCompleted >= 10) {
                await this.userService.updateScore(userId, 20);
                
                await this.participationService.completeParticipation(userId, challengeId);
            }
        }
    }
        
    private async checkBadgeEligibility(userId: string) {
        const stats = await this.workoutSessionService.getUserStats(userId);
        const user = await this.userService.findUserById(userId);
        
        const badges = await this.badgeService.getBadges(true);
        
        for(const badge of badges) {
            const hasEligibility = await this.userBadgeService.checkBadgeEligibility(userId, badge._id);
            if(!hasEligibility) continue;

            let shouldAward = false;
            const condition = badge.rules.condition;
            const value = badge.rules.value;

            switch(condition) {
                case 'sessionsCompleted':
                    shouldAward = stats.totalSessions >= value;
                    break;
                case 'caloriesBurned':
                    shouldAward = stats.totalCalories >= value;
                    break;
                case 'challengesCompleted':
                    const completedChallenges = await this.participationService.getUserCompletedChallenges(userId);
                    shouldAward = completedChallenges >= value;
                    break;
                case 'score':
                    shouldAward = (user?.score || 0) >= value;
                    break;
            }

            if(shouldAward) {
                await this.userBadgeService.awardBadge({
                    user: userId,
                    badge: badge._id,
                    earnedDate: new Date()
                });
            }
        }
    }

    async getMyStats(req: Request, res: Response) {
        const stats = await this.workoutSessionService.getUserStats(req.user!._id);
        res.json(stats);
    }

    async getLeaderboard(req: Request, res: Response) {
        const leaderboard = await this.userService.getLeaderboard(10);
        res.json(leaderboard);
    }

    async getMyWorkoutSessions(req: Request, res: Response) {
        const sessions = await this.workoutSessionService.getWorkoutSessions(req.user!._id);
        res.json(sessions);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/leaderboard', this.getLeaderboard.bind(this));
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.createWorkoutSession.bind(this));
        router.get('/my/sessions',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyWorkoutSessions.bind(this));
        router.get('/my/stats',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyStats.bind(this));
        return router;
    }
}