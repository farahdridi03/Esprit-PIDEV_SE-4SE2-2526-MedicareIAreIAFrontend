import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000) {
    const toast: Toast = { message, type, duration };
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast), duration);
    }
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }

  remove(toast: Toast) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t !== toast));
  }
}
