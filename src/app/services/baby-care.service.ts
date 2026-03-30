import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface BabyProfile {
  id: number;
  name: string;
  birthDate: string;
  gender: string;
  birthWeight: number;
  birthHeight: number;
  parentId: number;
  photoUrl?: string; // Base64 or Blob URL
  priorities?: string[];
}

export interface DiaperRecord {
  id?: number;
  babyId: number;
  diaperType: 'WET' | 'DIRTY' | 'MIXED';
  rashNoted: boolean;
  stoolColor?: string;
  stoolTexture?: string;
  notes?: string;
  changedAt: string; // ISO string
}

export interface BabyDashboard {
  id: number;
  name: string;
  ageText: string;
  ageDays: number;
  weightAtBirth: number;
  heightAtBirth: number;
  photoUrl?: string;
  dailyTip: string;
  aiContextualMessage: string;
  lastFeedingText: string;
  sleepQualityText: string;
  nextVaccineName: string;
  nextVaccineDate: string;
  nextCheckupDate: string;
  milestoneProgress: number;
  totalSleepSecondsToday?: number;
  weeklySleep?: { day: string, totalSeconds?: number, isToday?: boolean }[];
  diaperTotalToday?: number;
  diaperWetToday?: number;
  diaperDirtyToday?: number;
  diaperSummaryToday?: { total: number, wet: number, dirty: number };
}

@Injectable({
  providedIn: 'root'
})
export class BabyCareService {
  private STORAGE_KEY_PROFILES = 'fbc_profiles';
  private STORAGE_KEY_JOURNAL = 'fbc_journal';
  private apiUrl = 'http://localhost:8081/springsecurity/api/baby-care';
  
  constructor(private http: HttpClient) {}

  // Helpers
  private getProfiles(): BabyProfile[] {
    const data = localStorage.getItem(this.STORAGE_KEY_PROFILES);
    return data ? JSON.parse(data) : [];
  }

  private saveProfiles(profiles: BabyProfile[]): void {
    localStorage.setItem(this.STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  }

  private getJournals(): any[] {
    const data = localStorage.getItem(this.STORAGE_KEY_JOURNAL);
    return data ? JSON.parse(data) : [];
  }

  private saveJournals(journals: any[]): void {
    localStorage.setItem(this.STORAGE_KEY_JOURNAL, JSON.stringify(journals));
  }

  private parseDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        return new Date(+parts[2], +parts[1] - 1, +parts[0]);
      }
    }
    return new Date(dateStr);
  }

  private calculateAge(birthDate: string): string {
    const bday = this.parseDate(birthDate);
    const now = new Date();
    
    if (bday.getTime() > now.getTime()) {
      return 'Not born yet';
    }

    let years = now.getFullYear() - bday.getFullYear();
    let months = now.getMonth() - bday.getMonth();
    let days = now.getDate() - bday.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      days += lastMonth.getDate();
    }
    
    if (months < 0) {
      years--;
      months += 12;
    }

    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months}m`;
    return `${days} days`;
  }

  // API Methods
  createProfile(parentId: number, profileData: any): Observable<BabyProfile> {
    const endpoint = `${this.apiUrl}/profile?parentId=${parentId}`;
    
    const requestBody = {
      name: profileData.name,
      birthDate: profileData.birthDate,
      gender: profileData.gender || 'UNKNOWN',
      birthWeight: profileData.birthWeight || 0,
      birthHeight: profileData.birthHeight || 0,
      photoUrl: profileData.photoUrl,
      priorities: profileData.priorities || []
    };

    return this.http.post<any>(endpoint, requestBody).pipe(
      map((backendProfile: any) => {
        const profiles = this.getProfiles();
        const newProfile: BabyProfile = {
          id: backendProfile.id || Date.now(),
          parentId: parentId,
          name: profileData.name,
          birthDate: profileData.birthDate,
          gender: profileData.gender || 'UNKNOWN',
          birthWeight: profileData.birthWeight || 0,
          birthHeight: profileData.birthHeight || 0,
          photoUrl: profileData.photoUrl,
          priorities: profileData.priorities || []
        };
        
        // Remove old profiles for this parent if any, and add the new one
        const filtered = profiles.filter(p => p.parentId !== parentId);
        filtered.push(newProfile);
        this.saveProfiles(filtered);
        
        return newProfile;
      })
    );
  }

  getProfileByPatientId(patientId: number): Observable<BabyProfile> {
    return this.http.get<any>(`${this.apiUrl}/profile/${patientId}`).pipe(
      map(backendProfile => {
        const profile: BabyProfile = {
          id: backendProfile.id,
          name: backendProfile.name,
          birthDate: backendProfile.birthDate,
          gender: backendProfile.gender,
          birthWeight: backendProfile.birthWeight,
          birthHeight: backendProfile.birthHeight,
          parentId: backendProfile.patientId || patientId,
          photoUrl: backendProfile.photoUrl,
          priorities: backendProfile.preferences?.map((p: any) => p.priorityType) || []
        };
        const profiles = this.getProfiles().filter(p => p.parentId !== patientId);
        profiles.push(profile);
        this.saveProfiles(profiles);
        return profile;
      })
    );
  }

  getDashboard(babyId: number): Observable<BabyDashboard> {
    return this.http.get<any>(`${this.apiUrl}/dashboard/${babyId}`).pipe(
      map(dash => {
        const profiles = this.getProfiles();
        const profile = profiles.find(p => p.id === babyId);
        
        const journals = this.getJournals().filter(j => j.babyId === babyId);
        const lastFeeding = journals.find(j => j.type === 'FEEDING');
        const lastSleep = journals.find(j => j.type === 'SLEEP');
        
        // Enrich backend dashboard with local enrichment if needed
        const birthDateStr = profile ? profile.birthDate : '';
        const ageInDays = birthDateStr ? Math.max(0, Math.floor((new Date().getTime() - this.parseDate(birthDateStr).getTime()) / (1000 * 60 * 60 * 24))) : 0;
        
        // Next vaccine logic from backend's upcoming list
        const nextV = dash.upcomingVaccines && dash.upcomingVaccines.length > 0 ? dash.upcomingVaccines[0] : null;

        return {
          id: dash.id,
          name: dash.name,
          ageText: dash.age,
          ageDays: ageInDays,
          weightAtBirth: dash.weightAtBirth,
          heightAtBirth: dash.heightAtBirth,
          photoUrl: profile ? profile.photoUrl : undefined,
          dailyTip: dash.dailyTip,
          aiContextualMessage: `Healthy growth detected for ${dash.name}. Consistency is key at this stage!`,
          lastFeedingText: lastFeeding ? this.getTimeAgo(lastFeeding.timestamp) : 'No logs yet',
          sleepQualityText: lastSleep ? (lastSleep.detail || 'Restful') : 'Log sleep',
          nextVaccineName: nextV ? nextV.name : 'All caught up!',
          nextVaccineDate: nextV ? new Date(nextV.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No pending',
          nextCheckupDate: dash.nextCheckupDate || 'Apr 12',
          milestoneProgress: dash.milestoneProgress || 0,
          totalSleepSecondsToday: dash.totalSleepSecondsToday || 0,
          weeklySleep: dash.weeklySleep ? dash.weeklySleep.map((d: any, index: number) => ({
            day: d.day,
            totalSeconds: d.totalSeconds,
            isToday: index === (dash.weeklySleep?.length || 0) - 1
          })) : [],
          diaperTotalToday: dash.diaperTotalToday || 0,
          diaperWetToday: dash.diaperWetToday || 0,
          diaperDirtyToday: dash.diaperDirtyToday || 0,
          diaperSummaryToday: {
            total: dash.diaperTotalToday || 0,
            wet: dash.diaperWetToday || 0,
            dirty: dash.diaperDirtyToday || 0
          }
        };
      })
    );
  }

  private formatMilestoneDate(birthDateStr: string, months: number): string {
    const d = this.parseDate(birthDateStr);
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  private VACCINE_SCHEDULE = [
    { name: "BCG", milestoneMonths: 0, description: "Tuberculosis Protection", detail: "Protects against tuberculosis meningitis and severe TB disease." },
    { name: "Hepatitis B", milestoneMonths: 2, description: "1st Dose", detail: "First of three doses protecting against liver disease caused by Hepatitis B." },
    { name: "Pentavalent 2", milestoneMonths: 4, description: "2nd Dose", detail: "Reinforcing protection against 5 key diseases (DTP-HepB-Hib)." },
    { name: "Oral Polio (OPV 2)", milestoneMonths: 4, description: "Polio Protection", detail: "Continued protection against poliovirus." },
    { name: "Pneumococcal (PCV 2)", milestoneMonths: 6, description: "2nd Dose", detail: "Protects against pneumonia and meningitis." }
  ];

  getVaccines(babyId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vaccines/${babyId}`).pipe(
      map(overview => {
        const profiles = this.getProfiles();
        const profile = profiles.find(p => p.id === babyId);
        const birthDate = profile ? this.parseDate(profile.birthDate) : new Date();
        const now = new Date();

        const mapper = (v: any) => {
          const status = v.status ? v.status.toLowerCase() : 'upcoming';
          const milestoneDate = v.dueDate ? new Date(v.dueDate) : now;
          const isReached = now >= milestoneDate;
          const isClickable = isReached && status !== 'done';

          // Milestone Label
          const diffInMonths = profile ? (milestoneDate.getFullYear() - birthDate.getFullYear()) * 12 + (milestoneDate.getMonth() - birthDate.getMonth()) : 0;
          const milestoneLabel = diffInMonths <= 0 ? 'Birth' : `${diffInMonths} Months`;
          
          let badge = 'Upcoming';
          let unlockMessage = '';
          if (status === 'done') {
            badge = '✓ Complete';
          } else {
            const daysOverdue = Math.floor((now.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24));
            if (isReached) {
              badge = daysOverdue > 7 ? '⚠️ Overdue' : '⏰ Due Now';
              unlockMessage = 'Available now';
            } else {
              const daysRemaining = Math.floor((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              badge = `📅 In ${daysRemaining} days`;
              unlockMessage = `Unlocks in ${daysRemaining} days`;
            }
          }

          return {
            ...v,
            status: status === 'overdue' ? 'due' : status,
            badge,
            isClickable,
            unlockMessage,
            milestoneLabel,
            completedDate: status === 'done' ? milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
            milestoneDate: milestoneDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          };
        };

        const timeline = [
          ...(overview.overdue || []).map(mapper),
          ...(overview.dueNow || []).map(mapper),
          ...(overview.upcoming || []).map(mapper),
          ...(overview.done || []).map(mapper)
        ];

        return { ...overview, timeline };
      }),
      delay(100)
    );
  }

  private getVaccinesSync(babyId: number, birthDateStr: string): any[] {
    const birthDate = this.parseDate(birthDateStr);
    const now = new Date();
    
    // Calculate precise age in months
    let ageInMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());
    if (now.getDate() < birthDate.getDate()) {
       ageInMonths--;
    }

    const journals = this.getJournals().filter(j => j.babyId === babyId && j.type === 'VACCINE');

    return this.VACCINE_SCHEDULE.map(v => {
      const completed = journals.find(j => j.vaccineName === v.name);
      let status = 'upcoming';
      const isReached = ageInMonths >= v.milestoneMonths;
      
      if (completed) {
        status = 'done';
      } else if (isReached) {
        status = 'due';
      }

      // Map to UI friendly labels
      let badge = 'Upcoming';
      let unlockMessage = '';
      const isClickable = isReached && status !== 'done';

      if (status === 'done') {
        badge = '✓ Complete';
      } else if (status === 'due') {
        const milestoneDate = new Date(birthDate);
        milestoneDate.setMonth(milestoneDate.getMonth() + v.milestoneMonths);
        const daysOverdue = Math.floor((now.getTime() - milestoneDate.getTime()) / (1000 * 60 * 60 * 24));
        badge = daysOverdue > 7 ? '⚠️ Overdue' : '⏰ Due Now';
        unlockMessage = 'Available now';
      } else {
        const milestoneDate = new Date(birthDate);
        milestoneDate.setMonth(milestoneDate.getMonth() + v.milestoneMonths);
        const daysRemaining = Math.floor((milestoneDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        badge = `📅 In ${daysRemaining} days`;
        unlockMessage = daysRemaining > 30 
          ? `Unlocks at ${v.milestoneMonths} months` 
          : `Unlocks in ${daysRemaining} days`;
      }

      return {
        ...v,
        status,
        badge,
        isClickable,
        unlockMessage,
        completedDate: completed ? new Date(completed.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
        milestoneDate: this.formatMilestoneDate(birthDateStr, v.milestoneMonths),
        milestoneLabel: v.milestoneMonths === 0 ? 'Birth' : `${v.milestoneMonths} Months`
      };
    });
  }


  markVaccineDone(babyId: number, vaccineName: string): Observable<any> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.post(`${this.apiUrl}/vaccines/${babyId}/administered?name=${encodeURIComponent(vaccineName)}&date=${today}`, {});
  }

  resetVaccine(babyId: number, vaccineName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/vaccines/${babyId}/reset?name=${encodeURIComponent(vaccineName)}`);
  }


  updateProfilePhoto(babyId: number, photoUrl: string): Observable<BabyProfile> {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === babyId);
    if (index !== -1) {
      profiles[index].photoUrl = photoUrl;
      this.saveProfiles(profiles);
      return of(profiles[index]);
    }
    return throwError(() => new Error('Not found'));
  }

  private getTimeAgo(timestamp: number): string {
    const mins = Math.floor((Date.now() - timestamp) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }



  getJournal(babyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/journal/${babyId}`).pipe(
      map(entries => {
        const mappedLogs = entries.map(e => {
          let meta = {};
          if (e.metadata) {
            try { meta = JSON.parse(e.metadata); } catch(e){}
          } else if (e.notes) {
            try { 
              const metaStr = e.notes.includes('|||') ? e.notes.split('|||')[1] : e.notes;
              meta = JSON.parse(metaStr); 
            } catch(err) {}
          }
          const log: any = {
            id: e.id,
            babyId: e.babyProfileId,
            timestamp: new Date(e.createdAt).getTime(),
            time: new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            type: e.entryType,
            icon: this.getIconForType(e.entryType),
            title: this.getTitleForType(e.entryType),
            detail: e.value,
            badgeBg: '#f1f5f9',
            badgeColor: '#475569',
            notes: e.notes ? e.notes.split('|||')[0] : '',
            ...meta
          };
          log.badge = this.getBadgeForMappedLog(log);
          return log;
        }).sort((a,b) => b.timestamp - a.timestamp);
        
        // Keep local cache synced for sync methods
        const journals = this.getJournals().filter((j: any) => j.babyId !== babyId);
        journals.push(...mappedLogs);
        this.saveJournals(journals);
        
        return mappedLogs;
      }),
      delay(100)
    );
  }

  addJournalEntry(babyId: number, type: string, value: string, notes?: string, metadata?: any): Observable<any> {
    const metaString = metadata ? JSON.stringify(metadata) : '';
    
    return this.http.post<any>(`${this.apiUrl}/journal/${babyId}`, {
      type: type,
      value: value,
      notes: notes || '',
      metadata: metaString
    }).pipe(
      map(e => {
        let meta = {};
        if (e.metadata) {
          try { meta = JSON.parse(e.metadata); } catch(err) {} 
        } else if (e.notes) {
          try { meta = JSON.parse(e.notes.includes('|||') ? e.notes.split('|||')[1] : e.notes); } catch(err) {} 
        }
        
        const log: any = {
          id: e.id,
          babyId: e.babyProfileId,
          timestamp: new Date(e.createdAt).getTime(),
          time: new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          type: e.entryType,
          icon: this.getIconForType(e.entryType),
          title: this.getTitleForType(e.entryType),
          detail: e.value,
          badgeBg: '#f1f5f9',
          badgeColor: '#475569',
          notes: e.notes ? e.notes.split('|||')[0] : '',
          ...meta
        };
        log.badge = this.getBadgeForMappedLog(log);

        const journals = this.getJournals();
        journals.push(log);
        this.saveJournals(journals);
        return log;
      })
    );
  }

  deleteJournalEntry(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/journal/${id}`);
  }

  updateJournalEntry(id: number, type: string, value: string, notes?: string, metadata?: any, babyId?: number): Observable<any> {
    const metaString = metadata ? JSON.stringify(metadata) : '';
    const body: any = {
      id: id,
      type: type,
      entryType: type,
      value: value,
      notes: notes || '',
      metadata: metaString
    };
    
    // Using POST to the profile-specific endpoint instead of PUT to the entry-specific endpoint
    // This is common in simple Spring Boot controllers that use repo.save(entity) for both operations
    const url = babyId ? `${this.apiUrl}/journal/${babyId}` : `${this.apiUrl}/journal/${id}`;
    return this.http.post<any>(url, body);
  }

  private getIconForType(type: string): string {
    const map: any = { 'FEEDING': '🍼', 'SLEEP': '🌙', 'DIAPER': '💧', 'TEMPERATURE': '🌡️', 'NOTE': '📝' };
    return map[type] || '📝';
  }

  private getTitleForType(type: string): string {
    const map: any = { 'FEEDING': 'Feeding', 'SLEEP': 'Sleep', 'DIAPER': 'Diaper Change', 'TEMPERATURE': 'Temperature', 'NOTE': 'Note' };
    return map[type] || 'Note';
  }

  private getBadgeForMappedLog(log: any): string {
    if (log.type === 'TEMPERATURE') {
      const t = parseFloat(log.detail);
      if (t >= 38) return 'High';
      return 'Normal';
    }
    if (log.type === 'SLEEP') {
      const s = log.totalDurationSeconds || ((log.duration || 0) * 60);
      if (s > 0) {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}min`;
      }
      return 'Logged';
    }
    if (log.type === 'FEEDING') {
      if (log.subType === 'BOTTLE') return `${log.quantity}ml`;
      if (log.subType === 'BREAST') {
        const d = log.duration || 0;
        return `${d}m · ${log.side === 'LEFT' ? 'L' : log.side === 'RIGHT' ? 'R' : 'Both'}`;
      }
      return 'Feeding';
    }
    if (log.type === 'DIAPER') {
      return log.subType || 'Logged';
    }
    return 'Logged';
  }

  getCategorySummaries(babyId: number): Observable<any> {
    const journals = this.getJournals().filter(j => j.babyId === babyId);
    const today = new Date().setHours(0,0,0,0);
    const todayLogs = journals.filter(j => j.timestamp >= today);

    // Sleep
    const sleepLogs = todayLogs.filter(j => j.type === 'SLEEP');
    const totalSleepMins = sleepLogs.reduce((acc, current) => acc + (current.duration || 0), 0);
    
    // Feeding
    const feedingLogs = todayLogs.filter(j => j.type === 'FEEDING').sort((a,b) => b.timestamp - a.timestamp);
    const bottleLogs = feedingLogs.filter(j => j.subType === 'BOTTLE');
    const breastLogs = feedingLogs.filter(j => j.subType === 'BREAST');

    const totalMl = bottleLogs.reduce((acc, current) => acc + (Number(current.quantity) || 0), 0);
    const avgMl = bottleLogs.length > 0 ? Math.round(totalMl / bottleLogs.length) : 0;

    const totalBreastMins = breastLogs.reduce((acc, current) => acc + (Number(current.duration) || 0), 0);
    const leftCount = breastLogs.filter(j => j.side === 'LEFT' || j.side === 'BOTH').length;
    const rightCount = breastLogs.filter(j => j.side === 'RIGHT' || j.side === 'BOTH').length;
    const bothCount = breastLogs.filter(j => j.side === 'BOTH').length;

    // Diaper
    const diaperLogs = todayLogs.filter(j => j.type === 'DIAPER');
    const wetCount = diaperLogs.filter(j => j.subType === 'WET' || j.subType === 'MIXED').length;
    const dirtyCount = diaperLogs.filter(j => j.subType === 'DIRTY' || j.subType === 'MIXED').length;

    // Health
    const tempLogs = journals.filter(j => j.type === 'TEMPERATURE');
    const latestTemp = tempLogs.length > 0 ? tempLogs[tempLogs.length - 1] : null;

    return of({
      sleep: { totalMins: totalSleepMins, targetMins: 840, count: sleepLogs.length },
      bottle: { totalMl: totalMl, sessionCount: bottleLogs.length, avgMl: avgMl, lastTime: bottleLogs.length > 0 ? bottleLogs[0].time : 'N/A' },
      breast: { totalMins: totalBreastMins, sessionCount: breastLogs.length, leftCount: leftCount, rightCount: rightCount, bothCount: bothCount, lastTime: breastLogs.length > 0 ? breastLogs[0].time : 'N/A' },
      feeding: { totalMl: totalMl, sessionCount: feedingLogs.length, lastTime: feedingLogs.length > 0 ? feedingLogs[0].time : 'N/A' }, // Keep just in case components break without it
      diaper: { total: diaperLogs.length, wet: wetCount, dirty: dirtyCount },
      health: { latest: latestTemp?.detail || 'N/A', status: this.getTempStatus(latestTemp?.detail) }
    }).pipe(delay(100));
  }

  // DIAPER API
  getDiapers(babyId: number): Observable<DiaperRecord[]> {
    return this.http.get<DiaperRecord[]>(`${this.apiUrl}/diapers/${babyId}`);
  }

  addDiaper(babyId: number, record: DiaperRecord): Observable<DiaperRecord> {
    return this.http.post<DiaperRecord>(`${this.apiUrl}/diapers/${babyId}`, record);
  }

  updateDiaper(id: number, record: DiaperRecord): Observable<DiaperRecord> {
    return this.http.put<DiaperRecord>(`${this.apiUrl}/diapers/record/${id}`, record);
  }

  deleteDiaper(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/diapers/record/${id}`);
  }

  private getTempStatus(val: string | undefined): string {
    if (!val) return 'Normal';
    const t = parseFloat(val);
    if (t >= 39) return 'High Fever';
    if (t >= 38) return 'Fever';
    if (t >= 37.5) return 'Mild Fever';
    return 'Normal';
  }
}
