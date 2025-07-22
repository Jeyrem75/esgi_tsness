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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const express_1 = __importDefault(require("express"));
const mongoose_1 = require("./services/mongoose");
const models_1 = require("./models");
const controllers_1 = require("./controllers");
(0, dotenv_1.config)();
function startAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield (0, mongoose_1.openConnection)();
        const userService = new mongoose_1.UserService(connection);
        const sessionService = new mongoose_1.SessionService(connection);
        const gymService = new mongoose_1.GymService(connection);
        const exerciseTypeService = new mongoose_1.ExerciseService(connection);
        const challengeService = new mongoose_1.ChallengeService(connection);
        const badgeService = new mongoose_1.BadgeService(connection);
        const workoutSessionService = new mongoose_1.WorkoutSessionService(connection);
        const challengeParticipationService = new mongoose_1.ChallengeParticipationService(connection);
        const userBadgeService = new mongoose_1.UserBadgeService(connection);
        yield bootstrapAPI(userService, exerciseTypeService, badgeService);
        const app = (0, express_1.default)();
        const authController = new controllers_1.AuthController(userService, sessionService);
        app.use('/auth', authController.buildRouter());
        const userController = new controllers_1.UserController(userService, sessionService);
        app.use('/users', userController.buildRouter());
        const gymController = new controllers_1.GymController(gymService, sessionService, userService);
        app.use('/gyms', gymController.buildRouter());
        const exerciseTypeController = new controllers_1.ExerciseController(exerciseTypeService, sessionService);
        app.use('/exercises', exerciseTypeController.buildRouter());
        const challengeController = new controllers_1.ChallengeController(challengeService, sessionService, challengeParticipationService, userService);
        app.use('/challenges', challengeController.buildRouter());
        const badgeController = new controllers_1.BadgeController(badgeService, sessionService, userBadgeService);
        app.use('/badges', badgeController.buildRouter());
        const workoutSessionController = new controllers_1.WorkoutSessionController(workoutSessionService, sessionService, challengeParticipationService, userBadgeService, badgeService, userService);
        app.use('/workout-sessions', workoutSessionController.buildRouter());
        app.listen(process.env.PORT, () => console.log(`API listening on port ${process.env.PORT}...`));
    });
}
function bootstrapAPI(userService, exerciseTypeService, badgeService) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof process.env.TSNESS_ROOT_EMAIL === 'undefined') {
            throw new Error('TSNESS_ROOT_EMAIL is not defined');
        }
        if (typeof process.env.TSNESS_ROOT_PASSWORD === 'undefined') {
            throw new Error('TSNESS_ROOT_PASSWORD is not defined');
        }
        const rootUser = yield userService.findUser(process.env.TSNESS_ROOT_EMAIL);
        if (!rootUser) {
            yield userService.createUser({
                firstName: 'Super',
                lastName: 'Admin',
                password: process.env.TSNESS_ROOT_PASSWORD,
                email: process.env.TSNESS_ROOT_EMAIL,
                role: models_1.UserRole.SUPER_ADMIN,
                isActive: true,
                score: 0
            });
            console.log('Super admin created successfully');
        }
        yield createBasicExerciseTypes(exerciseTypeService);
        yield createBasicBadges(badgeService);
    });
}
function createBasicExerciseTypes(exerciseService) {
    return __awaiter(this, void 0, void 0, function* () {
        const basicExercises = [
            {
                name: 'Cardio',
                description: 'Exercices cardiovasculaires pour améliorer l\'endurance',
                type: models_1.ExerciseType.CARDIO,
                targetMuscles: ['Coeur', 'Poumons'],
                difficulty: models_1.ExerciseDifficulty.BEGINNER
            },
            {
                name: 'Musculation',
                description: 'Exercices de renforcement musculaire',
                type: models_1.ExerciseType.MUSCULATION,
                targetMuscles: ['Muscles'],
                difficulty: models_1.ExerciseDifficulty.INTERMEDIATE
            },
            {
                name: 'Stretching',
                description: 'Exercices d\'étirement et de flexibilité',
                type: models_1.ExerciseType.STRETCHING,
                targetMuscles: ['Corps entier'],
                difficulty: models_1.ExerciseDifficulty.BEGINNER
            }
        ];
        for (const exercise of basicExercises) {
            try {
                yield exerciseService.createExercise(exercise);
            }
            catch (error) {
            }
        }
        console.log('Basic exercise types created');
    });
}
function createBasicBadges(badgeService) {
    return __awaiter(this, void 0, void 0, function* () {
        const basicBadges = [
            {
                name: 'Premier Défi',
                description: 'Compléter votre premier défi',
                rules: {
                    condition: 'challengesCompleted',
                    value: 1
                },
                isActive: true
            },
            {
                name: 'Défi Accompli',
                description: 'Réussir les défis avec accomplissement',
                rules: {
                    condition: 'challengesCompleted',
                    value: 5
                },
                isActive: true
            }
        ];
        for (const badge of basicBadges) {
            try {
                yield badgeService.createBadge(badge);
            }
            catch (error) {
            }
        }
        console.log('Basic badges created');
    });
}
startAPI().catch(console.error);
