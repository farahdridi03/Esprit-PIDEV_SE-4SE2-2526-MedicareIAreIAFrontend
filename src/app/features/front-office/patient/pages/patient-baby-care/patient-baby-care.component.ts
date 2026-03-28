import { Component, OnInit } from '@angular/core';
import { BabyCareService, BabyDashboard, BabyProfile } from '../../../../../services/baby-care.service';
import { AuthService } from '../../../../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-patient-baby-care',
  templateUrl: './patient-baby-care.component.html',
  styleUrls: ['./patient-baby-care.component.scss']
})
export class PatientBabyCareComponent implements OnInit {
  activeSection: string = 'dashboard';
  isFirstTime: boolean = false;
  isLoading: boolean = true;
  
  // Real Data
  baby: BabyDashboard | null = null;
  vaccineTimeline: any[] = [];
  journalLogs: any[] = [];
  diaperRecords: any[] = [];
  isDiaperSubmitting: boolean = false;
  editingDiaperId: number | null = null;
  newDiaper: any = { type: 'WET', rash: false, stoolColor: 'Yellow', stoolTexture: 'Normal', notes: '' };
  manualSleep: any = { 
    duration: 30, 
    show: false, 
    type: 'Nap', 
    presets: [30, 60, 90, 120, 180]
  };
  onboardingPhoto: string | null = null;
  Math = Math;
  
  weekData: { day: string, hours: number, totalSeconds?: number, isToday?: boolean }[] = [
    { day: 'Sun', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Mon', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Tue', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Wed', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Thu', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Fri', hours: 0, totalSeconds: 0, isToday: false },
    { day: 'Sat', hours: 0, totalSeconds: 0, isToday: false }
  ];

  get currentFormattedDate() {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  get parentRole() {
    return this.authService.getParentRole();
  }

  summaries: any = {
    sleep: { totalMins: 0, targetMins: 840, count: 0 },
    bottle: { totalMl: 0, sessionCount: 0, avgMl: 0, lastTime: 'N/A' },
    breast: { totalMins: 0, sessionCount: 0, leftCount: 0, rightCount: 0, bothCount: 0, lastTime: 'N/A' },
    feeding: { totalMl: 0, sessionCount: 0, lastTime: 'N/A' }, // fallback
    diaper: { total: 0, wet: 0, dirty: 0 },
    health: { latest: 'N/A', status: 'Normal' }
  };

  currentSleepTimer: { startTime: number, elapsed: string } | null = null;
  timerInterval: any;

  get userName() {
    const fullName = this.authService.getUserFullName() || 'Sarah';
    return fullName.split(' ')[0];
  }

  // Assets & Placeholders
  defaultMamaAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=512&auto=format&fit=crop';
  defaultBabyAvatar = 'https://images.unsplash.com/photo-1519689680058-324335c75eba?q=80&w=512&auto=format&fit=crop';

  // Onboarding Form
  onboardingForm!: FormGroup;

  sections = [
    { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
    { id: 'vaccination', label: 'Vaccination', icon: 'fas fa-syringe' },
    { id: 'feeding', label: 'Feeding', icon: 'fas fa-baby-bottle' },
    { id: 'sleep', label: 'Sleep', icon: 'fas fa-moon' },
    { id: 'diaper', label: 'Diaper', icon: 'fas fa-cloud' },
    { id: 'milestones', label: 'Milestones', icon: 'fas fa-chart-line' },
    { id: 'ai-help', label: 'AI Help', icon: 'fas fa-robot' },
    { id: 'journal', label: 'Journal', icon: 'fas fa-book' }
  ];

  activeAgeTab: string = '4-6';

  feedingGuides: any = {
    '0-3': {
      title: '0–3 Months — Breast Milk Only',
      description: 'Breast milk or formula is the only food your baby needs. This is providing complete nutrition and immunity. Do not introduce any solids yet.',
      tags: ['🤱 Breast or Formula Only', '⏱ Feed on demand'],
      foods: [
        { emoji: '🤱', name: 'Breast Milk', benefit: 'Complete nutrition' },
        { emoji: '🍼', name: 'Formula', benefit: 'Complete nutrition' }
      ]
    },
    '4-6': {
      title: '4–6 Months — Starting Solids',
      description: 'Breast milk or formula remains primary nutrition. Around 4–6 months, you can begin introducing single-ingredient purées — starting with iron-rich foods. Look for signs of readiness: sitting with support, showing interest in food, losing the tongue-thrust reflex.',
      tags: ['🤱 Breast or Formula First', '1 new food/week'],
      foods: [
        { emoji: '🥕', name: 'Carrot', benefit: 'Vitamin A' },
        { emoji: '🥦', name: 'Broccoli', benefit: 'Iron + Folate' },
        { emoji: '🍠', name: 'Sweet potato', benefit: 'Energy' },
        { emoji: '🍌', name: 'Banana', benefit: 'Potassium' },
        { emoji: '🍐', name: 'Pear', benefit: 'Digestion' },
        { emoji: '🥣', name: 'Oat porridge', benefit: 'Iron + Zinc' }
      ]
    },
    '7-9': {
      title: '7–9 Months — Thicker Textures',
      description: 'Offer mashed and finely chopped foods 2–3 times a day. Keep breastfeeding. Introduce protein-rich foods like lentils, chicken, and egg yolk.',
      tags: ['🥄 Mashed textures', '2–3 meals/day'],
      foods: [
        { emoji: '🍗', name: 'Chicken', benefit: 'Protein + Iron' },
        { emoji: '🥚', name: 'Egg yolk', benefit: 'Choline + Protein' },
        { emoji: '🫘', name: 'Lentils', benefit: 'Protein + Iron' },
        { emoji: '🥑', name: 'Avocado', benefit: 'Healthy fats' },
        { emoji: '🫐', name: 'Blueberries', benefit: 'Antioxidants' },
        { emoji: '🌾', name: 'Oats', benefit: 'Iron + Fiber' }
      ]
    },
    '10-12': {
      title: '10–12 Months — Family Foods',
      description: 'Your baby can now eat soft pieces of most family foods. Offer 3 meals and 2 snacks daily. Keep breastfeeding. Introduce a sippy cup.',
      tags: ['🍽 3 meals + 2 snacks', '🥛 Start sippy cup'],
      foods: [
        { emoji: '🐟', name: 'Fish', benefit: 'Omega-3 + Protein' },
        { emoji: '🧀', name: 'Cheese', benefit: 'Calcium' },
        { emoji: '🍳', name: 'Whole egg', benefit: 'Complete protein' },
        { emoji: '🫘', name: 'Beans', benefit: 'Fiber + Iron' },
        { emoji: '🥦', name: 'Broccoli', benefit: 'Vitamins' },
        { emoji: '🍚', name: 'Rice', benefit: 'Energy' }
      ]
    },
    '1-2yr': {
      title: '1–2 Years — Toddler Diet',
      description: 'Congratulations! Your baby is now a toddler. Cow\'s milk can now replace breast milk if desired. Offer a varied diet with 3 meals plus snacks.',
      tags: ['🥛 Cow\'s milk OK now', '🌈 Variety is key'],
      foods: [
        { emoji: '🥛', name: "Cow's milk", benefit: 'Calcium + Vitamin D' },
        { emoji: '🍖', name: 'Meat', benefit: 'Iron + Protein' },
        { emoji: '🥕', name: 'Vegetables', benefit: 'Vitamins' },
        { emoji: '🍎', name: 'Fruit', benefit: 'Fiber + Sugar' },
        { emoji: '🥜', name: 'Nut butters', benefit: 'Healthy fats' },
        { emoji: '🍞', name: 'Whole grain', benefit: 'Fiber + Energy' }
      ]
    }
  };

  milestonesData: any = {
    physical: [
      { title: 'Holds head steady', description: 'During tummy time and when held upright — neck muscles are getting strong!', achieved: true },
      { title: 'Pushes up on forearms', description: 'During tummy time, pushing up is excellent upper body development.', achieved: true },
      { title: 'Rolls from tummy to back', description: 'Some babies begin rolling around 4–5 months. Encourage with gentle play.', achieved: false }
    ],
    sensory: [
      { title: 'Follows moving objects with eyes', description: 'Tracking toys and faces is a sign of healthy visual development.', achieved: true },
      { title: 'Laughs and makes sounds', description: 'Cooing, squealing, and first laughs — early language is blooming.', achieved: true }
    ],
    social: [
      { title: 'Smiles spontaneously, especially at people', description: 'Social smiling shows strong emotional bonding and attachment.', achieved: true },
      { title: 'Shows excitement with familiar faces', description: 'Looking for your face, reaching arms up — attachment is deepening.', achieved: false }
    ]
  };

  constructor(
    private babyService: BabyCareService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.onboardingForm = this.fb.group({
      name: ['', Validators.required],
      birthDate: ['', Validators.required],
      gender: ['UNKNOWN'],
      birthWeight: [null, [Validators.min(0)]],
      birthHeight: [null, [Validators.min(0)]],
      priorities: [[]]
    });
    this.checkBabyProfile();
    this.onboardingPhoto = localStorage.getItem('onboarding_photo');
  }

  checkBabyProfile() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.babyService.getProfileByPatientId(userId).subscribe({
      next: (profile: BabyProfile) => {
        if (profile) {
          this.loadAllData(); // Use loadAllData to fetch all dashboard related data
        } else {
          this.isFirstTime = true;
          this.isLoading = false;
        }
      },
      error: () => {
        this.isFirstTime = true;
        this.isLoading = false;
      }
    });
  }

  saveOnboarding() {
    const parentId = this.authService.getUserId();
    if (!parentId || this.onboardingForm.invalid) return;

    const data = { ...this.onboardingForm.value, photoUrl: this.onboardingPhoto };
    this.babyService.createProfile(parentId, data).subscribe({
      next: (profile) => {
        this.isFirstTime = false;
        localStorage.removeItem('onboarding_photo');
        this.loadAllData(); // Use loadAllData after onboarding
      },
      error: () => alert('Failed to save profile')
    });
  }

  handlePhotoUpload(event: any, isDashboard: boolean = true): void {
    const file = event.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File is too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64 = e.target.result;
      if (isDashboard && this.baby) {
        this.babyService.updateProfilePhoto(this.baby!.id, base64).subscribe(() => {
          if (this.baby) this.baby.photoUrl = base64;
        });
      } else {
        this.onboardingPhoto = base64;
        localStorage.setItem('onboarding_photo', base64);
      }
    };
    reader.readAsDataURL(file);
  }

  loadAllData() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.isLoading = true;

    this.babyService.getProfileByPatientId(userId).subscribe({
      next: (profile) => {
        this.isFirstTime = false;
        this.babyService.getDashboard(profile.id).subscribe(dash => {
          this.baby = dash;
          if (dash.weeklySleep) {
            this.weekData = dash.weeklySleep.map((d: any, index: number) => ({
              ...d,
              isToday: index === (dash.weeklySleep?.length || 0) - 1
            }));
          }
          this.isLoading = false;
          this.loadSummaries();
          this.loadVaccines(profile.id);
          this.loadJournal(profile.id);
          this.loadDiapers(profile.id);
        });

      },
      error: () => {
        this.isFirstTime = true;
        this.isLoading = false;
      }
    });
  }

  loadSummaries() {
    if (!this.baby) return;
    this.babyService.getCategorySummaries(this.baby.id).subscribe(s => {
      this.summaries = s;
      // Override with real persistent data from backend dashboard
      // Override with real persistent data from backend dashboard in SECONDS
      if (this.baby?.totalSleepSecondsToday !== undefined) {
        this.summaries.sleep.totalMins = 0; // Reset
        this.summaries.sleep.totalSecs = this.baby.totalSleepSecondsToday;
      }
      if (this.baby?.diaperTotalToday !== undefined) {
        this.summaries.diaper = {
          total: this.baby.diaperTotalToday,
          wet: this.baby.diaperWetToday || 0,
          dirty: this.baby.diaperDirtyToday || 0
        };
      }
    });
  }

  startSleepTimer() {
    const startTime = Date.now();
    this.currentSleepTimer = { startTime, elapsed: '00:00:00' };
    this.timerInterval = setInterval(() => {
      const diff = Date.now() - startTime;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      this.currentSleepTimer!.elapsed = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    }, 1000);
  }

  stopSleepTimer() {
    if (!this.currentSleepTimer || !this.baby) return;
    clearInterval(this.timerInterval);
    
    // Calculate duration in seconds (unified unit)
    const rawDiff = Date.now() - this.currentSleepTimer.startTime;
    const totalSeconds = Math.floor(rawDiff / 1000);
    
    const value = this.formatSleepValue(totalSeconds);
    const metadata = { 
      totalDurationSeconds: totalSeconds,
      sleepType: 'Nap',
      manual: false 
    };

    this.babyService.addJournalEntry(this.baby.id, 'SLEEP', value, '', metadata)
      .subscribe(() => {
        this.currentSleepTimer = null;
        this.loadAllData();
      });
  }

  formatSleepValue(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs} sec`;
    return secs > 0 ? `${mins} min ${secs} sec` : `${mins} min`;
  }

  historyFilter: string = 'today';
  
  isToday(timestamp: number): boolean {
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }

  isYesterday(timestamp: number): boolean {
    const d = new Date(timestamp);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() && d.getMonth() === yesterday.getMonth() && d.getFullYear() === yesterday.getFullYear();
  }

  getFilteredSleepLogs(): any[] {
    const logs = this.journalLogs.filter(log => log.type === 'SLEEP');
    if (this.historyFilter === 'today') return logs.filter(l => this.isToday(l.timestamp));
    if (this.historyFilter === 'yesterday') return logs.filter(l => this.isYesterday(l.timestamp));
    return logs;
  }

  formatMinutes(totalMins: number): string {
    const totalSeconds = totalMins * 60;
    return this.displayDuration(totalSeconds);
  }

  // Master formatter for unified seconds
  displayDuration(totalSeconds: number): string {
    if (totalSeconds < 60) return `${totalSeconds} sec`;
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    
    if (h > 0) {
      return m > 0 ? `${h}h ${m}min` : `${h}h`;
    }
    return `${m} min`;
  }

  formatFullDuration(log: any): string {
    const s = log.totalDurationSeconds || ((log.duration || 0) * 60);
    return this.displayDuration(s);
  }

  getSleepQuality(totalMins: number): string {
    if (totalMins < 60) return 'Short';
    if (totalMins < 300) return 'Moderate';
    if (totalMins < 600) return 'Good';
    return 'Excellent';
  }

  getAvgSleepText(): string {
    if (this.summaries.sleep.count === 0) return '—';
    const avg = Math.floor(this.summaries.sleep.totalMins / this.summaries.sleep.count);
    return this.formatMinutes(avg);
  }

  toggleMilestone(m: any) {
    m.achieved = !m.achieved;
    // Persist if needed
  }

  loadVaccines(babyId?: number) {
    const id = babyId || this.baby?.id;
    if (!id) return;
    this.babyService.getVaccines(id).subscribe({
      next: (data) => {
        this.vaccineTimeline = data.timeline;
        if (this.baby) {
           this.baby.milestoneProgress = data.progressPercent;
           this.baby.nextVaccineName = data.nextVaccine?.name || 'All caught up!';
           this.baby.nextVaccineDate = data.nextVaccine?.dueDate ? new Date(data.nextVaccine.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No pending';
           this.baby.aiContextualMessage = data.summaryMessage;
        }
      }
    });
  }

  markAsDone(vaccineName: string) {
    if (!this.baby) return;
    this.babyService.markVaccineDone(this.baby.id, vaccineName).subscribe(() => {
      this.loadAllData();
    });
  }

  undoMarkAsDone(vaccineName: string) {
    if (!this.baby) return;
    if (confirm(`Are you sure you want to reset ${vaccineName}? This will mark it as not done.`)) {
      this.babyService.resetVaccine(this.baby.id, vaccineName).subscribe(() => {
        this.loadAllData();
      });
    }
  }

  toggleVaccineMenu(v: any, event: Event) {
    event.stopPropagation();
    // Close other menus first
    this.vaccineTimeline.forEach(item => {
      if (item !== v) item.showMenu = false;
    });
    v.showMenu = !v.showMenu;
  }

  loadJournal(babyId?: number) {
    const id = babyId || this.baby?.id;
    if (!id) return;
    this.babyService.getJournal(id).subscribe(data => this.journalLogs = data);
  }


  setSection(id: string) {
    this.activeSection = id;
  }

  togglePriority(p: string) {
    const currentPriorities = this.onboardingForm.get('priorities')?.value || [];
    const index = currentPriorities.indexOf(p);
    let updated;
    if (index > -1) {
      updated = currentPriorities.filter((item: string) => item !== p);
    } else {
      updated = [...currentPriorities, p];
    }
    this.onboardingForm.patchValue({ priorities: updated });
  }

  // ====== JOURNAL ======
  journalFilter: string = 'all';
  showAddEntry: boolean = false;
  journalDate: Date = new Date();

  newEntry: any = { 
    type: 'FEEDING', 
    value: '', 
    notes: '', 
    subType: 'BREAST', 
    quantity: 120, 
    duration: 15, 
    side: 'LEFT',
    stoolColor: 'Yellow',
    rash: false,
    medication: ''
  };

  get journalDateLabel(): string {
    const today = new Date();
    const d = this.journalDate;
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  }

  get journalDateFormatted(): string {
    return this.journalDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  setJournalFilter(filter: string) {
    this.journalFilter = filter;
    if (filter !== 'all') {
      this.newEntry.type = filter;
    }
  }

  get currentJournalConfig() {
    const configs: any = {
      'FEEDING': { label: 'Feeding', placeholder: 'e.g. Breastfed 20 min, left side...', icon: '🍼' },
      'SLEEP': { label: 'Sleep', placeholder: 'e.g. Morning nap, slept 1h 45min...', icon: '🌙' },
      'DIAPER': { label: 'Diaper', placeholder: 'e.g. Wet diaper, changed at 10:30 AM...', icon: '💧' },
      'TEMP': { label: 'Temperature', placeholder: 'e.g. 37.8°C, checked after nap...', icon: '🌡️' },
      'NOTE': { label: 'Note', placeholder: 'e.g. Baby seem exceptionally happy today...', icon: '📝' }
    };
    return configs[this.newEntry.type] || configs['FEEDING'];
  }

  // Demo log entries that would normally come from the backend
  demoLogs: any[] = [
    { time: '8:30\nAM', type: 'FEEDING', icon: '🤱', iconBg: '#fce4ec', title: 'Breastfed', detail: 'Left side 12 min · Right side 8 min · Sofia seemed satisfied after', badge: '20 mins total', badgeBg: '#f3e8ff', badgeColor: '#6b21a8' },
    { time: '9:15\nAM', type: 'DIAPER', icon: '💧', iconBg: '#e0f7fa', title: 'Diaper Change', detail: 'Wet · Normal yellow · No rash noted', badge: '✓ Normal', badgeBg: '#e8f5e9', badgeColor: '#2e7d32' },
    { time: '10:00\nAM', type: 'SLEEP', icon: '🌙', iconBg: '#fff8e1', title: 'Nap — Morning', detail: 'Fell asleep in crib · Woke at 11:45 AM · Seemed well rested', badge: '1h 45min', badgeBg: '#fff3cd', badgeColor: '#856404' },
    { time: '12:10\nPM', type: 'FEEDING', icon: '🤱', iconBg: '#fce4ec', title: 'Breastfed', detail: 'Right side 15 min · A bit fussy at the start but settled', badge: '15 mins', badgeBg: '#f3e8ff', badgeColor: '#6b21a8' },
    { time: '2:00\nPM', type: 'TEMP', icon: '🌡️', iconBg: '#fde8ff', title: 'Temperature Check', detail: 'Felt a little warm — checked temperature', badge: '37.8°C — Monitor', badgeBg: '#fff0f0', badgeColor: '#c53030' }
  ];

  get filteredLogs(): any[] {
    const combined = [...this.journalLogs, ...this.demoLogs];
    if (this.journalFilter === 'all') return combined;
    return combined.filter(l => l.type === this.journalFilter);
  }

  prevDay() { const d = new Date(this.journalDate); d.setDate(d.getDate() - 1); this.journalDate = d; }
  nextDay() { const d = new Date(this.journalDate); d.setDate(d.getDate() + 1); this.journalDate = d; }

  submitJournalEntry() {
    if (!this.baby || !this.newEntry.value) return;
    
    // Prepare metadata based on type
    const metadata: any = {};
    if (this.newEntry.type === 'FEEDING') {
      metadata.subType = this.newEntry.subType;
      if (this.newEntry.subType === 'BOTTLE') {
        metadata.quantity = this.newEntry.quantity;
      } else {
        metadata.side = this.newEntry.side;
        metadata.duration = this.newEntry.duration;
      }
    } else if (this.newEntry.type === 'SLEEP') {
      metadata.totalSeconds = this.newEntry.duration * 60;
    } else if (this.newEntry.type === 'DIAPER') {
      metadata.subType = this.newEntry.subType;
      metadata.stoolColor = this.newEntry.stoolColor;
      metadata.rash = this.newEntry.rash;
    }

    this.babyService.addJournalEntry(this.baby.id, this.newEntry.type, this.newEntry.value, this.newEntry.notes, metadata)
      .subscribe({
        next: () => {
          this.showAddEntry = false;
          this.resetNewEntry();
          this.loadAllData(); // Fully refresh dashboard metrics
        },
        error: () => alert('Failed to save entry')
      });
  }

  submitManualSleep() {
    if (!this.baby || !this.manualSleep.duration) return;
    
    // String content for legacy display, metadata for rich parsing
    const value = `Slept for ${this.manualSleep.duration} min`;
    const metadata = { 
      duration: this.manualSleep.duration, 
      sleepType: this.manualSleep.type, 
      totalDurationSeconds: this.manualSleep.duration * 60,
      manual: true 
    };
    
    this.babyService.addJournalEntry(this.baby.id, 'SLEEP', value, '', metadata)
      .subscribe({
        next: () => {
          this.manualSleep.show = false;
          this.resetManualSleep();
          this.loadAllData();
        },
        error: () => alert('Failed to save sleep log')
      });
  }

  resetManualSleep() {
    this.manualSleep = { 
      duration: 30, 
      show: false, 
      type: 'Nap', 
      presets: [30, 60, 90, 120, 180]
    };
  }

  resetNewEntry() {
    this.newEntry = { 
      type: this.newEntry.type, 
      value: '', 
      notes: '', 
      subType: this.newEntry.type === 'FEEDING' ? 'BREAST' : (this.newEntry.type === 'DIAPER' ? 'WET' : ''), 
      quantity: 120, 
      duration: 15, 
      side: 'LEFT',
      stoolColor: 'Yellow',
      rash: false,
      medication: ''
    };
  }

  // ====== DIAPER CRUD ======
  loadDiapers(babyId: number) {
    this.babyService.getDiapers(babyId).subscribe(data => {
      this.diaperRecords = data;
    });
  }

  onSubmitDiaper() {
    if (!this.baby) return;
    this.isDiaperSubmitting = true;
    
    const record: any = {
      babyId: this.baby.id,
      diaperType: this.newDiaper.type,
      rashNoted: this.newDiaper.rash,
      stoolColor: this.newDiaper.stoolColor || 'Yellow',
      stoolTexture: this.newDiaper.stoolTexture || 'Normal',
      notes: this.newDiaper.notes,
      changedAt: new Date().toISOString()
    };

    if (this.editingDiaperId) {
      this.babyService.updateDiaper(this.editingDiaperId, record).subscribe({
        next: () => {
          this.isDiaperSubmitting = false;
          this.editingDiaperId = null;
          this.resetDiaperForm();
          this.loadAllData();
        },
        error: () => this.isDiaperSubmitting = false
      });
    } else {
      this.babyService.addDiaper(this.baby.id, record).subscribe({
        next: () => {
          this.isDiaperSubmitting = false;
          this.resetDiaperForm();
          this.loadAllData();
        },
        error: () => this.isDiaperSubmitting = false
      });
    }
  }

  onEditDiaper(record: any) {
    this.editingDiaperId = record.id;
    this.newDiaper = {
      type: record.diaperType,
      rash: record.rashNoted,
      stoolColor: record.stoolColor || 'Yellow',
      stoolTexture: record.stoolTexture || 'Normal',
      notes: record.notes || ''
    };
    this.activeSection = 'diaper';
  }

  onDeleteDiaper(id: number) {
    if (confirm('Are you sure you want to delete this record?')) {
      this.babyService.deleteDiaper(id).subscribe(() => {
        this.loadAllData();
      });
    }
  }

  resetDiaperForm() {
    this.newDiaper = { type: 'WET', rash: false, stoolColor: 'Yellow', stoolTexture: 'Normal', notes: '' };
    this.editingDiaperId = null;
  }

  getDiaperIcon(type: string): string {
    if (type === 'WET') return '💧';
    if (type === 'DIRTY') return '💩';
    return '🌈';
  }

  onDeleteSleepLog(log: any) {
    if (confirm('Are you sure you want to delete this sleep record?')) {
      this.babyService.deleteJournalEntry(log.id).subscribe(() => {
        this.loadAllData();
      });
    }
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
