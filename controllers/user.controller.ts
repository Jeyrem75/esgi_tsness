import {SessionService, UserService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class UserController {
    constructor(public readonly userService: UserService,
                public readonly sessionService: SessionService) {
    }

    async deactivateUser(req: Request, res: Response) {
        const userId = req.params.id;
        await this.userService.deactivateUser(userId);
        res.status(204).end();
    }

    async deleteUser(req: Request, res: Response) {
        const userId = req.params.id;
        await this.userService.deleteUser(userId);
        res.status(204).end();
    }

    async deleteGymOwner(req: Request, res: Response) {
        const userId = req.params.id;
        const user = await this.userService.findUserById(userId);
        if(!user || user.role !== UserRole.GYM_OWNER) {
            res.status(404).end();
            return;
        }
        await this.userService.deleteUser(userId);
        res.status(204).end();
    }

    async getLeaderboard(req: Request, res: Response) {
        const limit = parseInt(req.query.limit as string) || 10;
        const leaderboard = await this.userService.getLeaderboard(limit);
        res.json(leaderboard);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/leaderboard', this.getLeaderboard.bind(this));
        router.patch('/:id/deactivate',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.deactivateUser.bind(this));      
        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.deleteUser.bind(this));
        router.delete('/gym-owner/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.deleteGymOwner.bind(this));
        return router;
    }
}