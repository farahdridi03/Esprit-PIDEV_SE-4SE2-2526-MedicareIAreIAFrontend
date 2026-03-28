import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BabyProfile } from '../models/baby-care.models';
import { BabyStorageService, STORAGE_KEYS } from './baby-storage.service';
import { v4 as uuid } from '../utils/uuid.util';

@Injectable({ providedIn: 'root' })
export class BabyProfileService {

  private _profile$ = new BehaviorSubject<BabyProfile | null>(null);
  profile$: Observable<BabyProfile | null> = this._profile$.asObservable();

  constructor(private storage: BabyStorageService) {
    const saved = this.storage.get<BabyProfile>(STORAGE_KEYS.PROFILE);
    if (saved) this._profile$.next(saved);
  }

  get snapshot(): BabyProfile | null {
    return this._profile$.getValue();
  }

  save(data: Omit<BabyProfile, 'id' | 'createdAt' | 'updatedAt'>): BabyProfile {
    const now = new Date().toISOString();
    const existing = this.snapshot;
    const profile: BabyProfile = {
      ...(existing ?? { id: uuid(), createdAt: now }),
      ...data,
      updatedAt: now,
    } as BabyProfile;
    this.storage.set(STORAGE_KEYS.PROFILE, profile);
    this._profile$.next(profile);
    return profile;
  }

  /** Age helpers */
  getAgeInDays(dob?: string): number {
    const birth = new Date(dob ?? this.snapshot?.dateOfBirth ?? '');
    if (isNaN(birth.getTime())) return 0;
    return Math.floor((Date.now() - birth.getTime()) / 86_400_000);
  }

  getAgeDisplay(dob?: string): string {
    const days = this.getAgeInDays(dob);
    if (days < 7) return `${days}d old`;
    const weeks = Math.floor(days / 7);
    if (weeks < 8) return `${weeks}w old`;
    const months = Math.floor(days / 30.44);
    const remDays = days - Math.floor(months * 30.44);
    return `${months}m ${remDays}d old`;
  }

  getAgeWeeks(dob?: string): number {
    return Math.floor(this.getAgeInDays(dob) / 7);
  }
}
