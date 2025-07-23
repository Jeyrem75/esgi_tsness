import {SessionService, GymService, UserService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole, GymStatus, getUserRoleLevel} from "../models";

export class GymController {
    constructor(public readonly gymService: GymService,
                public readonly sessionService: SessionService,
                public readonly userService: UserService) {
    }

    async createGym(req: Request, res: Response) {
        if(!req.body || !req.body.name || !req.body.description || !req.body.address || !req.body.capacity) {
            res.status(400).end();
            return;
        }

        const address = req.body.address;
        if(!address.street || !address.city || !address.zipCode) {
            res.status(400).end();
            return;
        }

        const gym = await this.gymService.createGym({
            name: req.body.name,
            description: req.body.description,
            address: address,
            phone: req.body.phone,
            equipment: req.body.equipment || [],
            activities: req.body.activities || [],
            capacity: req.body.capacity,
            owner: req.user!._id,
            status: GymStatus.PENDING
        });

        res.status(201).json(gym);
    }

    async updateMyGym(req: Request, res: Response) {
        const gymId = req.params.id;
        
        const gym = await this.gymService.getGymById(gymId);
        if(!gym) {
            res.status(404).end();
            return;
        }

        const gymOwnerId = typeof gym.owner === 'string' ? gym.owner : gym.owner._id;
        const isOwner = gymOwnerId.toString() === req.user?._id.toString();

        if (!isOwner) {
            res.status(403).end();
            return;
        }

        const updatedGym = await this.gymService.updateGym(gymId, req.body);
        res.json(updatedGym);
    }

    async deleteMyGym(req: Request, res: Response) {
        const gymId = req.params.id;
        
        const gym = await this.gymService.getGymById(gymId);
        if(!gym) {
            res.status(404).end();
            return;
        }

        if(gym.owner.toString() !== req.user!._id) {
            res.status(403).end();
            return;
        }

        await this.gymService.deleteGym(gymId);
        res.status(204).end();
    }

    async approveGym(req: Request, res: Response) {
        const gymId = req.params.id;
        await this.gymService.approveGym(gymId);
        
        const gym = await this.gymService.getGymById(gymId);
        if(gym) {
            await this.userService.updateScore(gym.owner.toString(), 10);
        }
        
        res.status(204).end();
    }

    async rejectGym(req: Request, res: Response) {
        const gymId = req.params.id;
        await this.gymService.rejectGym(gymId);
        res.status(204).end();
    }

    async adminCreateGym(req: Request, res: Response) {
        if(!req.body || !req.body.name || !req.body.description || !req.body.address || !req.body.capacity || !req.body.owner) {
            res.status(400).end();
            return;
        }

        const gym = await this.gymService.createGym({
            ...req.body,
            status: GymStatus.APPROVED
        });

        res.status(201).json(gym);
    }

    async adminUpdateGym(req: Request, res: Response) {
        const gymId = req.params.id;
        const updatedGym = await this.gymService.updateGym(gymId, req.body);
        if(!updatedGym) {
            res.status(404).end();
            return;
        }
        res.json(updatedGym);
    }

    async adminDeleteGym(req: Request, res: Response) {
        const gymId = req.params.id;
        await this.gymService.deleteGym(gymId);
        res.status(204).end();
    }

    async getGyms(req: Request, res: Response) {
        const status = req.query.status as GymStatus;
        const gyms = await this.gymService.getGyms(status);
        res.json(gyms);
    }

    async getGymById(req: Request, res: Response) {
        const gymId = req.params.id;
        const gym = await this.gymService.getGymById(gymId);
        if(!gym) {
            res.status(404).end();
            return;
        }
        res.json(gym);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/', this.getGyms.bind(this));
        router.get('/:id', this.getGymById.bind(this));
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.GYM_OWNER),
            json(),
            this.createGym.bind(this));
        router.put('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.GYM_OWNER),
            json(),
            this.updateMyGym.bind(this));
        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.GYM_OWNER),
            this.deleteMyGym.bind(this));
        router.patch('/:id/approve',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.approveGym.bind(this));
        router.patch('/:id/reject',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.rejectGym.bind(this));
        router.post('/admin/create',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            json(),
            this.adminCreateGym.bind(this));
        router.put('/admin/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            json(),
            this.adminUpdateGym.bind(this));
        router.delete('/admin/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.adminDeleteGym.bind(this));
        return router;
    }
}