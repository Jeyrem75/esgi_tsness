import {SessionService, ExerciseService} from "../services/mongoose";
import {Request, Response, Router, json} from "express";
import {roleMiddleware, sessionMiddleware} from "../middlewares";
import {UserRole} from "../models";

export class ExerciseController {
    constructor(public readonly exerciseService: ExerciseService,
                public readonly sessionService: SessionService) {
    }

    async createExercise(req: Request, res: Response) {
        if(!req.body || !req.body.name || !req.body.description || !req.body.type || !req.body.targetMuscles || !req.body.difficulty) {
            res.status(400).end();
            return;
        }

        try {
            const exercise = await this.exerciseService.createExercise({
                name: req.body.name,
                description: req.body.description,
                type: req.body.type,
                targetMuscles: req.body.targetMuscles,
                difficulty: req.body.difficulty
            });
            res.status(201).json(exercise);
        } catch {
            res.status(409).end();
        }
    }

    async updateExercise(req: Request, res: Response) {
        const exerciseId = req.params.id;
        const updatedExercise = await this.exerciseService.updateExercise(exerciseId, req.body);
        if(!updatedExercise) {
            res.status(404).end();
            return;
        }
        res.json(updatedExercise);
    }

    async deleteExercise(req: Request, res: Response) {
        const exerciseId = req.params.id;
        await this.exerciseService.deleteExercise(exerciseId);
        res.status(204).end();
    }

    async getExercises(req: Request, res: Response) {
        const exercises = await this.exerciseService.getExercises();
        res.json(exercises);
    }

    async getExerciseById(req: Request, res: Response) {
        const exerciseId = req.params.id;
        const exercise = await this.exerciseService.getExerciseById(exerciseId);
        if(!exercise) {
            res.status(404).end();
            return;
        }
        res.json(exercise);
    }

    buildRouter(): Router {
        const router = Router();
        router.get('/', this.getExercises.bind(this));
        router.get('/:id', this.getExerciseById.bind(this));
        router.post('/',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            json(),
            this.createExercise.bind(this));
        router.put('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            json(),
            this.updateExercise.bind(this));
        router.delete('/:id',
            sessionMiddleware(this.sessionService),
            roleMiddleware(UserRole.SUPER_ADMIN),
            this.deleteExercise.bind(this));
        return router;
    }
}