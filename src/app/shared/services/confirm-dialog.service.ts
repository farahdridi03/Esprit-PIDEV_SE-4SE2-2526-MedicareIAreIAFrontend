import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface ConfirmData {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {
  private confirmSubject = new Subject<{ data: ConfirmData, resolve: (result: boolean) => void }>();
  
  // Observable for the component to listen to
  get confirmRequests$() {
    return this.confirmSubject.asObservable();
  }

  confirm(data: ConfirmData): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSubject.next({ data, resolve });
    });
  }
}
