import {SessionService, ChallengeService, ChallengeParticipationService, UserService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole, ChallengeDifficulty, ParticipationStatus} from "../models";

export class ChallengeController {
    constructor(
        public readonly challengeService: ChallengeService,
        public readonly sessionService: SessionService,
        public readonly participationService: ChallengeParticipationService,
        public readonly userService: UserService
    ) {}

    async createChallenge(req: Request, res: Response) {
        if(!req.body || !req.body.title || !req.body.description || !req.body.difficulty || !req.body.duration) {
            res.status(400).end();
            return;
        }

        if(!Object.values(ChallengeDifficulty).includes(req.body.difficulty)) {
            res.status(400).json({error: 'Invalid difficulty'});
            return;
        }

        try {
            const challenge = await this.challengeService.createChallenge({
                title: req.body.title,
                description: req.body.description,
                difficulty: req.body.difficulty,
                duration: req.body.duration,
                exercises: req.body.exercises || [],
                gym: req.body.gym,
                creator: req.user!._id,
                isActive: true
            });

            await this.userService.updateScore(req.user!._id, 5);

            res.status(201).json(challenge);
        } catch (error) {
            res.status(500).json({error: 'Failed to create challenge'});
        }
    }

    async getChallenges(req: Request, res: Response) {
        const filters: any = {};
        
        if(req.query.difficulty) filters.difficulty = req.query.difficulty;
        if(req.query.gym) filters.gym = req.query.gym;

        const challenges = await this.challengeService.getChallenges(filters);
        res.json(challenges);
    }

    async getChallengeById(req: Request, res: Response) {
        const challengeId = req.params.id;
        const challenge = await this.challengeService.getChallengeById(challengeId);
        if(!challenge) {
            res.status(404).end();
            return;
        }
        res.json(challenge);
    }

    async joinChallenge(req: Request, res: Response) {
        const challengeId = req.params.id;
        const userId = req.user!._id;

        const challenge = await this.challengeService.getChallengeById(challengeId);
        if(!challenge) {
            res.status(404).end();
            return;
        }

        const existingParticipation = await this.participationService.getParticipation(userId, challengeId);
        if(existingParticipation) {
            res.status(409).json({error: 'Already participating in this challenge'});
            return;
        }

        await this.challengeService.joinChallenge(challengeId, userId);

        await this.participationService.createParticipation({
            user: userId,
            challenge: challengeId,
            status: ParticipationStatus.ACTIVE,
            progress: {
                sessionsCompleted: 0,
                totalCaloriesBurned: 0,
                completionPercentage: 0
            },
            startDate: new Date(),
            badgesEarned: []
        });

        res.status(200).json({message: 'Successfully joined challenge'});
    }

    async inviteToChallenge(req: Request, res: Response) {
        const challengeId = req.params.id;
        const {userIds} = req.body;

        if(!userIds || !Array.isArray(userIds)) {
            res.status(400).json({error: 'userIds array required'});
            return;
        }

        const challenge = await this.challengeService.getChallengeById(challengeId);
        if(!challenge) {
            res.status(404).end();
            return;
        }

        if(challenge.creator.toString() !== req.user!._id && 
           !challenge.participants.some(p => p.toString() === req.user!._id)) {
            res.status(403).end();
            return;
        }

        for(const userId of userIds) {
            await this.challengeService.joinChallenge(challengeId, userId);
            await this.participationService.createParticipation({
                user: userId,
                challenge: challengeId,
                status: ParticipationStatus.ACTIVE,
                progress: {
                    sessionsCompleted: 0,
                    totalCaloriesBurned: 0,
                    completionPercentage: 0
                },
                startDate: new Date(),
                badgesEarned: []
            });
        }

        res.status(200).json({message: 'Users invited successfully'});
    }

    async getMyChallenges(req: Request, res: Response) {
        const challenges = await this.challengeService.getChallengesByCreator(req.user!._id);
        res.json(challenges);
    }

    async getMyParticipations(req: Request, res: Response) {
        const challenges = await this.challengeService.getChallengesByParticipant(req.user!._id);
        res.json(challenges);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/', this.getChallenges.bind(this));
        router.get('/:id', this.getChallengeById.bind(this));
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.createChallenge.bind(this));
        router.get('/my/created',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyChallenges.bind(this));
        router.get('/my/participations',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyParticipations.bind(this));
        router.post('/:id/join',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.joinChallenge.bind(this));
        router.post('/:id/invite',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            json(),
            this.inviteToChallenge.bind(this));
        return router;
    }
}