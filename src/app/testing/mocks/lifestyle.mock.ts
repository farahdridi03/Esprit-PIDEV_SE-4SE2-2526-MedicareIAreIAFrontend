import { LifestyleGoal, LifestylePlan, ProgressTracking, GoalCategory, GoalStatus, PlanStatus } from '../../models/lifestyle.model';

export const MOCK_GOALS: LifestyleGoal[] = [
    {
        id: 1,
        patientId: 101,
        category: GoalCategory.WEIGHT_LOSS,
        targetValue: 75,
        baselineValue: 85,
        targetDate: '2026-12-31',
        status: GoalStatus.IN_PROGRESS
    },
    {
        id: 2,
        patientId: 101,
        category: GoalCategory.FITNESS,
        targetValue: 10000,
        baselineValue: 2000,
        targetDate: '2026-06-30',
        status: GoalStatus.ACHIEVED
    }
];

export const MOCK_PLANS: LifestylePlan[] = [
    {
        id: 1,
        lifestyleGoalId: 1,
        title: 'Diet Plan',
        description: 'Low carb diet',
        startDate: '2026-01-01',
        endDate: '2026-03-01',
        status: PlanStatus.ACTIVE
    }
];

export const MOCK_TRACKINGS: ProgressTracking[] = [
    {
        id: 1,
        patientId: 101,
        goalId: 1,
        date: '2026-01-15',
        value: 83,
        notes: 'Good progress'
    },
    {
        id: 2,
        patientId: 101,
        goalId: 1,
        date: '2026-02-01',
        value: 81,
        notes: 'Continuing well'
    }
];
