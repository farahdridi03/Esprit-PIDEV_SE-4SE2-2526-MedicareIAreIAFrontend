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
  formError: string = '';
  
  // Real Data
  baby: BabyDashboard | null = null;
  vaccineTimeline: any[] = [];
  journalLogs: any[] = [];
  diaperRecords: any[] = [];
  isDiaperSubmitting: boolean = false;
  editingDiaperId: number | null = null;
  editingLogId: number | null = null;
  confirmModalData: { title: string, message: string, onConfirm: () => void } | null = null;
  newDiaper: any = { type: 'WET', rash: false, stoolColor: 'Yellow', stoolTexture: 'Normal', notes: '' };
  manualSleep: any = { 
    duration: '', 
    show: false, 
    type: 'Nap', 
    presets: [30, 60, 90, 120, 180]
  };
  onboardingPhoto: string | null = null;
  Math = Math;
  
  weekData: { day: string, totalSeconds?: number, isToday?: boolean }[] = [
    { day: 'Sun', totalSeconds: 0, isToday: false },
    { day: 'Mon', totalSeconds: 0, isToday: false },
    { day: 'Tue', totalSeconds: 0, isToday: false },
    { day: 'Wed', totalSeconds: 0, isToday: false },
    { day: 'Thu', totalSeconds: 0, isToday: false },
    { day: 'Fri', totalSeconds: 0, isToday: false },
    { day: 'Sat', totalSeconds: 0, isToday: false }
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
    { id: 'health', label: 'Temp', icon: 'fas fa-thermometer-half' },
    { id: 'sleep', label: 'Sleep', icon: 'fas fa-moon' },
    { id: 'diaper', label: 'Diaper', icon: 'fas fa-cloud' },
    { id: 'ai-help', label: 'AI Help', icon: 'fas fa-robot' },
    { id: 'journal', label: 'Journal', icon: 'fas fa-book' }
  ];

  activeAgeTab: string = '4-6';
  selectedFood: any = null;

  selectAgeTab(tab: string) {
    this.activeAgeTab = tab;
    this.selectedFood = null;
  }

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
        { 
          emoji: '🥕', name: 'Carrot', benefit: 'Vitamin A',
          recipe: {
            tag: 'Vitamine A · Doux pour l\'estomac',
            intro: 'La carotte est souvent le premier légume proposé. Naturellement sucrée et facile à digérer.',
            ingredients: ['2 carottes bio', 'Un filet d\'eau'],
            steps: ['Pèle et coupe en fines rondelles.', 'Cuis à la vapeur 15-20 min jusqu\'à tendreté.', 'Mixe jusqu\'à texture lisse.']
          }
        },
        { 
          emoji: '🥦', name: 'Broccoli', benefit: 'Iron + Folate',
          recipe: {
            tag: 'Fer · Système immunitaire',
            intro: 'Le brocoli est excellent pour le développement, avec un goût un peu plus prononcé.',
            ingredients: ['Quelques fleurettes de brocoli'],
            steps: ['Lave bien et coupe en petites fleurettes.', 'Cuis à la vapeur 10-12 min.', 'Mixe en ajoutant de l\'eau de cuisson si besoin.']
          }
        },
        { 
          emoji: '🍠', name: 'Sweet potato', benefit: 'Energy',
          recipe: {
            tag: 'Énergie douce · Fibres',
            intro: 'Très appréciée des bébés pour sa texture fondante et son goût sucré.',
            ingredients: ['1 petite patate douce'],
            steps: ['Pèle et coupe en cubes.', 'Cuis à la vapeur 15 min.', 'Écrase ou mixe finement.']
          }
        },
        { 
          emoji: '🍌', name: 'Banana', benefit: 'Potassium',
          recipe: {
            tag: 'Énergie rapide · Digestion',
            intro: 'Le fruit le plus simple pour commencer : pas besoin de cuisson !',
            ingredients: ['1/2 banane bien mûre'],
            steps: ['Pèle la banane.', 'Écrase-la très finement à la fourchette.', 'Sers immédiatement (tu peux ajouter un peu de lait maternel).']
          }
        },
        { 
          emoji: '🍐', name: 'Pear', benefit: 'Digestion',
          recipe: {
            tag: 'Fibres · Aide la digestion',
            intro: 'La poire est douce et légèrement laxative — parfaite si bébé a tendance à être constipé.',
            ingredients: ['2 poires mûres', 'Un filet d\'eau'],
            steps: ['Pèle et épépine les poires. Coupe en morceaux.', 'Cuis à la vapeur 5-7 min (ou cru si très mûres).', 'Mixe jusqu\'à texture lisse.']
          }
        },
        { 
          emoji: '🥣', name: 'Oat porridge', benefit: 'Iron + Zinc',
          recipe: {
            tag: 'Céréales douces · Satiété',
            intro: 'L\'avoine est très digeste et parfaite pour habituer bébé à une texture un peu plus épaisse.',
            ingredients: ['2 c. à soupe de flocons d\'avoine mixés', 'Lait maternel ou infantile'],
            steps: ['Mélange l\'avoine et le liquide dans une petite casserole.', 'Fais chauffer doucement 3-5 min en remuant.', 'Laisse tiédir avant de servir.']
          }
        }
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

  constructor(
    private babyService: BabyCareService,
    public authService: AuthService,
    private fb: FormBuilder
  ) {}

  pastDateValidator(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0,0,0,0);
    return selectedDate > today ? { 'futureDate': true } : null;
  }

  maxOneYearValidator(control: any): { [key: string]: any } | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return selectedDate < oneYearAgo ? { 'tooOld': true } : null;
  }

  ngOnInit(): void {
    this.onboardingForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      birthDate: ['', [Validators.required, this.pastDateValidator, this.maxOneYearValidator]],
      gender: ['', Validators.required],
      birthWeight: [null, [Validators.required, Validators.min(0), Validators.max(15)]],
      birthHeight: [null, [Validators.required, Validators.min(0), Validators.max(80)]],
      priorities: [[], [Validators.required, Validators.minLength(1)]]
    });
    this.checkBabyProfile();
    this.onboardingPhoto = localStorage.getItem('onboarding_photo');

    this.onboardingForm.valueChanges.subscribe(() => {
      if (this.formError) this.formError = '';
    });
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
    if (this.onboardingForm.invalid || !this.onboardingPhoto) {
      this.onboardingForm.markAllAsTouched();
      this.formError = !this.onboardingPhoto 
        ? "Please add a photo of the baby." 
        : "Please fill in all required fields correctly.";
      return;
    }
    
    const parentId = this.authService.getUserId();
    if (!parentId) return;

    this.formError = '';
    const data = { ...this.onboardingForm.value, photoUrl: this.onboardingPhoto };
    this.babyService.createProfile(parentId, data).subscribe({
      next: (profile) => {
        this.isFirstTime = false;
        this.formError = '';
        localStorage.removeItem('onboarding_photo');
        this.loadAllData(); // Use loadAllData after onboarding
      },
      error: (err) => {
        this.formError = "Error creating profile. Please check the fields.";
        console.error(err);
      }
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
        this.formError = ''; // Clear photo error immediately
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
      manual: false 
    };

    this.babyService.addJournalEntry(this.baby.id, 'SLEEP', value, '', metadata)
      .subscribe(() => {
        this.currentSleepTimer = null;
        this.loadAllData();
      });
  }

  formatSleepValue(totalSeconds: number): string {
    return this.displayDuration(totalSeconds);
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
    let filtered = logs;
    if (this.historyFilter === 'today') filtered = logs.filter(l => this.isToday(l.timestamp));
    else if (this.historyFilter === 'yesterday') filtered = logs.filter(l => this.isYesterday(l.timestamp));
    return filtered;
  }

  selectedLogIds = new Set<number>();
  
  toggleSelectLog(id: number) {
    if (this.selectedLogIds.has(id)) this.selectedLogIds.delete(id);
    else this.selectedLogIds.add(id);
  }

  isLogSelected(id: number): boolean {
    return this.selectedLogIds.has(id);
  }

  toggleSelectAll() {
    const logs = this.getFilteredSleepLogs();
    if (this.selectedLogIds.size === logs.length) {
      this.selectedLogIds.clear();
    } else {
      logs.forEach(l => this.selectedLogIds.add(l.id));
    }
  }

  deleteSelectedLogs() {
    if (this.selectedLogIds.size === 0) return;
    if (confirm(`Are you sure you want to delete ${this.selectedLogIds.size} records?`)) {
      const idsToDelete = Array.from(this.selectedLogIds);
      let count = 0;
      idsToDelete.forEach(id => {
        this.babyService.deleteJournalEntry(id).subscribe(() => {
          count++;
          if (count === idsToDelete.length) {
            this.selectedLogIds.clear();
            this.loadAllData();
          }
        });
      });
      // In case of error (simplified)
      setTimeout(() => { this.selectedLogIds.clear(); this.loadAllData(); }, 1500);
    }
  }

  formatMinutes(totalMins: number): string {
    const totalSeconds = totalMins * 60;
    return this.displayDuration(totalSeconds);
  }

  // Master formatter for unified seconds
  displayDuration(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    
    if (h > 0) return `${h}h ${m}min ${s}sec`;
    if (m > 0) return `${m}min ${s}sec`;
    return `${s}sec`;
  }

  // Concise formatter for the weekly chart (hours only)
  displayChartDuration(totalSeconds: number): string {
    const hours = Math.round((totalSeconds / 3600) * 10) / 10;
    return `${hours}h`;
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

  onResetVaccine(v: any) {
    this.confirmModalData = {
      title: 'Reset Vaccination',
      message: `Are you sure you want to reset the status for ${v.name}? This will mark it as incomplete.`,
      onConfirm: () => {
        if (!this.baby) return;
        this.babyService.resetVaccine(this.baby.id, v.name).subscribe(() => {
          this.loadAllData();
        });
      }
    };
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
    this.formError = '';
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
      'TEMPERATURE': { label: 'Temperature', placeholder: 'e.g. 37.8°C, checked after nap...', icon: '🌡️' },
      'NOTE': { label: 'Note', placeholder: 'e.g. Baby seem exceptionally happy today...', icon: '📝' }
    };
    return configs[this.newEntry.type] || configs['FEEDING'];
  }


  get filteredLogs(): any[] {
    if (this.journalFilter === 'all') return this.journalLogs;
    return this.journalLogs.filter(l => l.type === this.journalFilter);
  }

  prevDay() { const d = new Date(this.journalDate); d.setDate(d.getDate() - 1); this.journalDate = d; }
  nextDay() { const d = new Date(this.journalDate); d.setDate(d.getDate() + 1); this.journalDate = d; }

  submitJournalEntry() {
    this.formError = '';
    if (!this.baby || !this.newEntry.value) {
      if (!this.newEntry.value) this.formError = "Please enter a value.";
      return;
    }

    if (this.newEntry.type === 'TEMPERATURE') {
      const tempVal = parseFloat(this.newEntry.value);
      if (isNaN(tempVal) || tempVal < 30 || tempVal > 45) {
        this.formError = "Temperature must be between 30°C and 45°C.";
        return;
      }
    } else if (this.newEntry.type === 'FEEDING') {
      if (this.newEntry.subType === 'BOTTLE') {
        const qty = parseFloat(this.newEntry.quantity);
        if (isNaN(qty) || qty <= 0 || qty > 1000) {
           this.formError = "Quantity must be between 1 and 1000 ml.";
           return;
        }
      } else {
        const dur = this.parsedDuration(this.newEntry.duration);
        if (dur <= 0 || dur > 7200) { 
           this.formError = "Duration must be between 1 min and 2 hours.";
           return;
        }
      }
    } else if (this.newEntry.type === 'SLEEP') {
      const totalSeconds = this.parsedDuration(this.newEntry.duration);
      if (totalSeconds < 60 || totalSeconds > 86400) {
          this.formError = "Sleep duration must be between 1 min and 24 hours.";
          return;
      }
    } else if (this.newEntry.type === 'DIAPER') {
      if (!this.newEntry.subType) {
        this.formError = "Diaper type (Wet/Dirty) is required.";
        return;
      }
    }
    
    // Prepare metadata based on type
    const metadata: any = {};
    if (this.newEntry.type === 'SLEEP') {
      const totalSeconds = this.parsedDuration(this.newEntry.duration);
      metadata.totalDurationSeconds = totalSeconds;
      if (!this.newEntry.value) {
        this.newEntry.value = this.displayDuration(totalSeconds);
      }
    } else if (this.newEntry.type === 'FEEDING') {
      metadata.subType = this.newEntry.subType;
      if (this.newEntry.subType === 'BOTTLE') {
        metadata.quantity = this.newEntry.quantity;
      } else {
        metadata.side = this.newEntry.side;
        metadata.duration = this.newEntry.duration;
        metadata.totalDurationSeconds = this.parsedDuration(this.newEntry.duration);
      }
    } else if (this.newEntry.type === 'DIAPER') {
      metadata.subType = this.newEntry.subType;
      metadata.stoolColor = this.newEntry.stoolColor;
      metadata.rash = this.newEntry.rash;
    }

    const obs = this.editingLogId 
      ? this.babyService.updateJournalEntry(this.editingLogId, this.newEntry.type, this.newEntry.value, this.newEntry.notes, metadata, this.baby.id)
      : this.babyService.addJournalEntry(this.baby.id, this.newEntry.type, this.newEntry.value, this.newEntry.notes, metadata);

    obs.subscribe({
        next: () => {
          this.showAddEntry = false;
          this.editingLogId = null;
          this.formError = '';
          this.resetNewEntry();
          this.loadAllData();
        },
        error: (err) => {
          this.formError = "Server Error: Unable to save entry.";
          console.error(err);
        }
      });
  }

  onEditJournalEntry(log: any) {
    this.editingLogId = log.id;
    this.newEntry = { ...log, value: log.detail };
    this.activeSection = log.type.toLowerCase();
    if (this.activeSection === 'journal') this.activeSection = 'journal'; // Fallback
    
    // Fallbacks for specific fields
    if (log.type === 'FEEDING') {
      this.newEntry.subType = log.subType || 'BREAST';
      this.newEntry.quantity = log.quantity || 120;
      this.newEntry.duration = log.duration || 15;
      this.newEntry.side = log.side || 'LEFT';
    } else if (log.type === 'DIAPER') {
      this.newEntry.subType = log.subType || 'WET';
      this.newEntry.stoolColor = log.stoolColor || 'Yellow';
      this.newEntry.rash = log.rash || false;
    } else if (log.type === 'TEMPERATURE') {
      this.newEntry.value = log.detail;
    }
    
    // Auto scroll to form
    const formClass = log.type === 'FEEDING' ? '.log-action-card' : 
                     (log.type === 'DIAPER' ? '.diaper-log-card' : 
                     (log.type === 'TEMPERATURE' ? '.premium-log-action-card' : '.log-action-card'));
    
    setTimeout(() => {
      const el = document.querySelector(formClass);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  onDeleteJournalEntry(log: any) {
    this.confirmModalData = {
      title: 'Delete Record',
      message: `Are you sure you want to delete this ${log.title.toLowerCase()} record? This action cannot be undone.`,
      onConfirm: () => {
        this.babyService.deleteJournalEntry(log.id).subscribe(() => {
          this.loadAllData();
        });
      }
    };
  }

  closeConfirmModal() {
    this.confirmModalData = null;
  }

  executeConfirmAction() {
    if (this.confirmModalData?.onConfirm) {
      this.confirmModalData.onConfirm();
    }
    this.closeConfirmModal();
  }

  cancelJournalEdit() {
    this.editingLogId = null;
    this.resetNewEntry();
  }

  parsedDuration(input: any): number {
    if (typeof input === 'number') return input * 60;
    if (!input) return 0;
    
    const str = input.toLowerCase().trim();
    let totalSec = 0;
    
    const hMatch = str.match(/(\d+)\s*h/);
    const mMatch = str.match(/(?:h\s*)?(\d+)\s*(?:m|min)/) || str.match(/(\d+)\s*(?:m|min)/);
    const sMatch = str.match(/(\d+)\s*(?:s|sec)/);
    
    if (hMatch) totalSec += parseInt(hMatch[1]) * 3600;
    if (mMatch) totalSec += parseInt(mMatch[1]) * 60;
    if (sMatch) totalSec += parseInt(sMatch[1]);
    
    if (totalSec === 0 && /^\d+$/.test(str)) {
      totalSec = parseInt(str) * 60;
    }
    return totalSec;
  }

  get parsedManualSeconds(): number {
    return this.parsedDuration(this.manualSleep.duration);
  }

  submitManualSleep() {
    this.formError = '';
    const totalSeconds = this.parsedManualSeconds;
    if (!this.baby) return;

    if (totalSeconds < 60 || totalSeconds > 86400) { // between 1 min and 24 hours
        this.formError = "Sleep duration must be realistic (between 1 minute and 24 hours).";
        return;
    }
    
    const value = this.displayDuration(totalSeconds);
    const metadata = { 
      durationString: this.manualSleep.duration,
      totalDurationSeconds: totalSeconds,
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
      duration: '', 
      show: false, 
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

    if (this.editingDiaperId || (this.editingLogId && this.newEntry.type === 'DIAPER')) {
      const id = this.editingDiaperId || this.editingLogId;
      const obs = this.editingDiaperId 
        ? this.babyService.updateDiaper(this.editingDiaperId, record) 
        : this.babyService.updateJournalEntry(this.editingLogId!, 'DIAPER', this.newDiaper.type, this.newDiaper.notes, {
            subType: this.newDiaper.type,
            rash: this.newDiaper.rash,
            stoolColor: this.newDiaper.stoolColor,
            stoolTexture: this.newDiaper.stoolTexture
          }, this.baby.id);

      obs.subscribe({
        next: () => {
          this.isDiaperSubmitting = false;
          this.editingDiaperId = null;
          this.editingLogId = null;
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
    this.confirmModalData = {
      title: 'Delete Diaper Record',
      message: 'Are you sure you want to delete this record?',
      onConfirm: () => {
        this.babyService.deleteDiaper(id).subscribe(() => {
          this.loadAllData();
        });
      }
    };
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
    this.confirmModalData = {
      title: 'Delete Sleep Record',
      message: 'Are you sure you want to delete this sleep record? This action will remove it from your history and charts.',
      onConfirm: () => {
        this.babyService.deleteJournalEntry(log.id).subscribe(() => {
          this.loadAllData();
        });
      }
    };
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

}
