import {config} from "dotenv";
import express from "express";
import {
    openConnection, 
    SessionService, 
    UserService,
    GymService,
    ExerciseService,
    ChallengeService,
    BadgeService,
    WorkoutSessionService,
    ChallengeParticipationService,
    UserBadgeService
} from "./services/mongoose";
import {ExerciseDifficulty, ExerciseType, UserRole} from "./models";
import {
    AuthController, 
    UserController,
    GymController,
    ExerciseController,
    ChallengeController,
    BadgeController,
    WorkoutSessionController
} from "./controllers";

config();

async function startAPI() {
    const connection = await openConnection();
    
    const userService = new UserService(connection);
    const sessionService = new SessionService(connection);
    const gymService = new GymService(connection);
    const exerciseTypeService = new ExerciseService(connection);
    const challengeService = new ChallengeService(connection);
    const badgeService = new BadgeService(connection);
    const workoutSessionService = new WorkoutSessionService(connection);
    const challengeParticipationService = new ChallengeParticipationService(connection);
    const userBadgeService = new UserBadgeService(connection);
    
    await bootstrapAPI(userService, exerciseTypeService, badgeService);
    
    const app = express();
    
    const authController = new AuthController(userService, sessionService);
    app.use('/auth', authController.buildRouter());
    
    const userController = new UserController(userService, sessionService);
    app.use('/users', userController.buildRouter());
    
    const gymController = new GymController(gymService, sessionService, userService);
    app.use('/gyms', gymController.buildRouter());
    
    const exerciseTypeController = new ExerciseController(exerciseTypeService, sessionService);
    app.use('/exercises', exerciseTypeController.buildRouter());
    
    const challengeController = new ChallengeController(
        challengeService, 
        sessionService, 
        challengeParticipationService,
        userService
    );
    app.use('/challenges', challengeController.buildRouter());
    
    const badgeController = new BadgeController(badgeService, sessionService, userBadgeService);
    app.use('/badges', badgeController.buildRouter());
    
    const workoutSessionController = new WorkoutSessionController(
        workoutSessionService,
        sessionService,
        challengeParticipationService,
        userBadgeService,
        badgeService,
        userService
    );
    app.use('/workout-sessions', workoutSessionController.buildRouter());
    
    app.listen(process.env.PORT, () => console.log(`API listening on port ${process.env.PORT}...`));
}

async function bootstrapAPI(
    userService: UserService, 
    exerciseTypeService: ExerciseService,
    badgeService: BadgeService
) {
    if(typeof process.env.TSNESS_ROOT_EMAIL === 'undefined') {
        throw new Error('TSNESS_ROOT_EMAIL is not defined');
    }
    if(typeof process.env.TSNESS_ROOT_PASSWORD === 'undefined') {
        throw new Error('TSNESS_ROOT_PASSWORD is not defined');
    }
    
    const rootUser = await userService.findUser(process.env.TSNESS_ROOT_EMAIL);
    if(!rootUser) {
        await userService.createUser({
            firstName: 'Super',
            lastName: 'Admin',
            password: process.env.TSNESS_ROOT_PASSWORD,
            email: process.env.TSNESS_ROOT_EMAIL,
            role: UserRole.SUPER_ADMIN,
            isActive: true,
            score: 0
        });
        console.log('Super admin created successfully');
    }
    
    await createBasicExerciseTypes(exerciseTypeService);
    
    await createBasicBadges(badgeService);
}

async function createBasicExerciseTypes(exerciseService: ExerciseService) {
    const basicExercises = [
        {
            name: 'Cardio',
            description: 'Exercices cardiovasculaires pour améliorer l\'endurance',
            type: ExerciseType.CARDIO,
            targetMuscles: ['Coeur', 'Poumons'],
            difficulty: ExerciseDifficulty.BEGINNER
        },
        {
            name: 'Musculation',
            description: 'Exercices de renforcement musculaire',
            type: ExerciseType.MUSCULATION,
            targetMuscles: ['Muscles'],
            difficulty: ExerciseDifficulty.INTERMEDIATE
        },
        {
            name: 'Stretching',
            description: 'Exercices d\'étirement et de flexibilité',
            type: ExerciseType.STRETCHING,
            targetMuscles: ['Corps entier'],
            difficulty: ExerciseDifficulty.BEGINNER
        }
    ];
    
    for(const exercise of basicExercises) {
        try {
            await exerciseService.createExercise(exercise);
        } catch (error) {
        }
    }
    console.log('Basic exercise types created');
}

async function createBasicBadges(badgeService: BadgeService) {
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
    
    for(const badge of basicBadges) {
        try {
            await badgeService.createBadge(badge);
        } catch (error) {
        }
    }
    console.log('Basic badges created');
}

startAPI().catch(console.error);