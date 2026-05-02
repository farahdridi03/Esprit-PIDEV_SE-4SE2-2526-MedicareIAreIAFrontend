import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LifestyleGoal, LifestylePlan, ProgressTracking } from '../models/lifestyle.model';

@Injectable({
    providedIn: 'root'
})
export class LifestyleService {
    private readonly baseUrl = 'http://localhost:8081/springsecurity/api/v1';

    constructor(private http: HttpClient) { }

    // Lifestyle Goals
    getGoals(): Observable<LifestyleGoal[]> {
        return this.http.get<LifestyleGoal[]>(`${this.baseUrl}/lifestyle-goals`);
    }

    getGoalsByPatientId(patientId: number): Observable<LifestyleGoal[]> {
        return this.http.get<LifestyleGoal[]>(`${this.baseUrl}/lifestyle-goals/patient/${patientId}`);
    }

    getGoalById(id: number): Observable<LifestyleGoal> {
        return this.http.get<LifestyleGoal>(`${this.baseUrl}/lifestyle-goals/${id}`);
    }

    addGoal(goal: LifestyleGoal): Observable<LifestyleGoal> {
        return this.http.post<LifestyleGoal>(`${this.baseUrl}/lifestyle-goals`, goal);
    }

    updateGoal(id: number, goal: LifestyleGoal): Observable<LifestyleGoal> {
        return this.http.put<LifestyleGoal>(`${this.baseUrl}/lifestyle-goals/${id}`, goal);
    }

    deleteGoal(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/lifestyle-goals/${id}`);
    }

    // Lifestyle Plans
    getPlans(): Observable<LifestylePlan[]> {
        return this.http.get<LifestylePlan[]>(`${this.baseUrl}/lifestyle-plans`);
    }

    getPlanCount(): Observable<number> {
        return this.http.get<number>(`${this.baseUrl}/lifestyle-plans/count`);
    }

    getPlansByPatientId(patientId: number): Observable<LifestylePlan[]> {
        return this.http.get<LifestylePlan[]>(`${this.baseUrl}/lifestyle-plans/patient/${patientId}`);
    }

    getPlanById(id: number): Observable<LifestylePlan> {
        return this.http.get<LifestylePlan>(`${this.baseUrl}/lifestyle-plans/${id}`);
    }

    addPlan(plan: any): Observable<LifestylePlan> {
        return this.http.post<LifestylePlan>(`${this.baseUrl}/lifestyle-plans`, plan);
    }

    updatePlan(id: number, plan: any): Observable<LifestylePlan> {
        return this.http.put<LifestylePlan>(`${this.baseUrl}/lifestyle-plans/${id}`, plan);
    }

    deletePlan(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/lifestyle-plans/${id}`);
    }

    // Progress Tracking
    getTrackings(): Observable<ProgressTracking[]> {
        return this.http.get<ProgressTracking[]>(`${this.baseUrl}/progress-tracking`);
    }

    getTrackingsByPatientId(patientId: number): Observable<ProgressTracking[]> {
        return this.http.get<ProgressTracking[]>(`${this.baseUrl}/progress-tracking/patient/${patientId}`);
    }

    getTrackingById(id: number): Observable<ProgressTracking> {
        return this.http.get<ProgressTracking>(`${this.baseUrl}/progress-tracking/${id}`);
    }

    addTracking(tracking: ProgressTracking): Observable<ProgressTracking> {
        return this.http.post<ProgressTracking>(`${this.baseUrl}/progress-tracking`, tracking);
    }

    updateTracking(id: number, tracking: ProgressTracking): Observable<ProgressTracking> {
        return this.http.put<ProgressTracking>(`${this.baseUrl}/progress-tracking/${id}`, tracking);
    }

    deleteTracking(id: number): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/progress-tracking/${id}`);
    }

}
