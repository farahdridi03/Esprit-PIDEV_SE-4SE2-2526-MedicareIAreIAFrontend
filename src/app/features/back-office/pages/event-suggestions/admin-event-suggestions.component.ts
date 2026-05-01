import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface EventSuggestion {
  id: number;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  suggestedBy?: { fullName: string; email: string };
}

@Component({
  selector: 'app-admin-event-suggestions',
  templateUrl: './admin-event-suggestions.component.html',
  styleUrls: ['./admin-event-suggestions.component.scss']
})
export class AdminEventSuggestionsComponent implements OnInit {
  suggestions: EventSuggestion[] = [];
  loading = false;

  private baseUrl = 'http://localhost:8081/springsecurity/api/event-suggestions';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.http.get<EventSuggestion[]>(this.baseUrl).subscribe({
      next: (res) => { this.suggestions = res; this.loading = false; },
      error: (err) => { console.error(err); this.loading = false; }
    });
  }

  createEventFromSuggestion(s: EventSuggestion) {
    this.router.navigate(['/admin/events/create'], {
      queryParams: { title: s.title, description: s.description }
    });
  }

  dismiss(id: number) {
    // Just mark locally for now
    this.suggestions = this.suggestions.filter(s => s.id !== id);
  }
}
