import { Component, OnInit } from '@angular/core';
import { ConfirmDialogService, ConfirmData } from './shared/services/confirm-dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  modalOpen = false;
  modalData: ConfirmData = { message: '' };
  private resolveFn: ((res: boolean) => void) | null = null;

  constructor(private confirmService: ConfirmDialogService) {}

  ngOnInit() {
    this.confirmService.confirmRequests$.subscribe(request => {
      this.modalData = request.data;
      this.resolveFn = request.resolve;
      this.modalOpen = true;
    });
  }

  handleConfirm() {
    this.modalOpen = false;
    if (this.resolveFn) this.resolveFn(true);
  }

  handleCancel() {
    this.modalOpen = false;
    if (this.resolveFn) this.resolveFn(false);
  }
}
