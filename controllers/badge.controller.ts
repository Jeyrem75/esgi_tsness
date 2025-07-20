import {SessionService, BadgeService, UserBadgeService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class BadgeController {
    constructor(
        public readonly badgeService: BadgeService,
        public readonly sessionService: SessionService,
        public readonly userBadgeService: UserBadgeService
    ) {}

    async createBadge(req: Request, res: Response) {
        if(!req.body || !req.body.name || !req.body.description || !req.body.rules) {
            res.status(400).end();
            return;
        }

        if(!req.body.rules.condition || req.body.rules.value === undefined) {
            res.status(400).json({error: 'Invalid rules format'});
            return;
        }

        try {
            const badge = await this.badgeService.createBadge({
                name: req.body.name,
                description: req.body.description,
                rules: {
                    condition: req.body.rules.condition,
                    value: req.body.rules.value
                },
                isActive: true
            });
            res.status(201).json(badge);
        } catch {
            res.status(409).end();
        }
    }

    async getBadges(req: Request, res: Response) {
        const badges = await this.badgeService.getBadges(true);
        res.json(badges);
    }

    async getBadgeById(req: Request, res: Response) {
        const badgeId = req.params.id;
        const badge = await this.badgeService.getBadgeById(badgeId);
        if(!badge) {
            res.status(404).end();
            return;
        }
        res.json(badge);
    }

    async getMyBadges(req: Request, res: Response) {
        const userBadges = await this.userBadgeService.getUserBadges(req.user!._id);
        res.json(userBadges);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/', this.getBadges.bind(this));
        router.get('/:id', this.getBadgeById.bind(this));
        router.get('/my/badges',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.CLIENT),
            this.getMyBadges.bind(this));
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            json(),
            this.createBadge.bind(this));
        return router;
    }
}