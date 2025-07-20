import {SessionService, UserService} from "../services/mongoose";
import {json, Request, Response, Router} from "express";
import {sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class AuthController {
    constructor(public readonly userService: UserService,
                public readonly sessionService: SessionService) {
    }

    async login(req: Request, res: Response) {
        if(!req.body || !req.body.email || !req.body.password) {
            res.status(400).end();
            return;
        }
        const user = await this.userService.findUser(req.body.email, req.body.password);
        if(!user) {
            res.status(401).end();
            return;
        }
        const session = await this.sessionService.createSession({
            user: user,
            expirationDate: new Date(Date.now() + 1_296_000_000)
        });
        res.status(201).json(session);
    }

    async me(req: Request, res: Response) {
        res.json(req.user);
    }

    async subscribe(req: Request, res: Response) {
        if(!req.body || !req.body.email || !req.body.password
            || !req.body.lastName || !req.body.firstName || !req.body.role) {
            res.status(400).end();
            return;
        }

        if(!Object.values(UserRole).includes(req.body.role)) {
            res.status(400).json({error: 'Invalid role'});
            return;
        }

        try {
            const user = await this.userService.createUser({
                email: req.body.email,
                role: req.body.role,
                password: req.body.password,
                lastName: req.body.lastName,
                firstName: req.body.firstName,
                isActive: true,
                score: 0
            });
            res.status(201).json(user);
        } catch {
            res.status(409).end();
        }
    }

    buildRouter(): Router {
        const router = Router();
        router.post('/login', json(), this.login.bind(this));
        router.post('/subscribe', json(), this.subscribe.bind(this));
        router.get('/me',
            sessionMiddleware(this.sessionService),
            this.me.bind(this));
        return router;
    }
}