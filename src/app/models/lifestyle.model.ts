export enum GoalCategory {
    WEIGHT_LOSS = 'WEIGHT_LOSS',
    WEIGHT_GAIN = 'WEIGHT_GAIN',
    MUSCLE_GAIN = 'MUSCLE_GAIN',
    MAINTENANCE = 'MAINTENANCE',
    FITNESS = 'FITNESS',
    NUTRITION = 'NUTRITION',
    GENERAL_HEALTH = 'GENERAL_HEALTH'
}

export enum GoalStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRESS',
    ACHIEVED = 'ACHIEVED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED',
    ABANDONED = 'ABANDONED'
}

export enum PlanStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export interface LifestyleGoal {
    id?: number;
    patientId: number;
    category: GoalCategory;
    targetValue: number;
    baselineValue: number;
    targetDate: string;
    status: GoalStatus;
    plans?: LifestylePlan[];
}

export interface LifestylePlan {
    id?: number;
    lifestyleGoalId: number;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    status: PlanStatus;
    createdAt?: string;
}

export interface ProgressTracking {
    id?: number;
    patientId: number;
    goalId: number;
    date: string;
    value: number;
    notes: string;
}


