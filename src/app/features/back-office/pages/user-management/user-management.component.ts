import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { UserResponseDTO, UserRequestDTO } from '../../../../models/user.model';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  users: UserResponseDTO[] = [];
  loading: boolean = false;
  viewState: 'list' | 'add' | 'edit' = 'list';
  filterRole: string = 'ALL';

  currentPage = 1; pageSize = 8;
  get totalPages() { return Math.ceil(this.users.length / this.pageSize); }
  get pagedUsers() { const s = (this.currentPage - 1) * this.pageSize; return this.users.slice(s, s + this.pageSize); }
  get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageEnd() { return Math.min(this.currentPage * this.pageSize, this.users.length); }
  goToPage(p: number) { if (p >= 1 && p <= this.totalPages) this.currentPage = p; }

  // Form fields
  currentId: number | null = null;
  formModel: UserRequestDTO = {
    fullName: '',
    email: '',
    password: '',
    role: 'PATIENT',
    phone: '',
    birthDate: ''
  };

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.refresh();
  }

  onFilterChange(event: Event) {
    this.refresh();
  }

  refresh() {
    this.loading = true;
    const fetchObs = this.filterRole === 'ALL'
      ? this.userService.getAll()
      : this.userService.getByRole(this.filterRole);

    fetchObs.subscribe({
      next: (res) => {
        this.users = res;
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to get users', err);
        this.loading = false;
      }
    });
  }

  viewAdd() {
    this.formModel = { fullName: '', email: '', password: '', role: 'PATIENT', phone: '', birthDate: '' };
    this.currentId = null;
    this.viewState = 'add';
  }

  viewEdit(u: UserResponseDTO) {
    this.formModel = {
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      phone: u.phone || '',
      birthDate: u.birthDate || '',
      password: ''
    };
    this.currentId = u.id;
    this.viewState = 'edit';
  }

  cancelForm() {
    this.viewState = 'list';
  }

  saveUser() {
    this.loading = true;
    if (this.viewState === 'add') {
      this.userService.create(this.formModel).subscribe({
        next: () => {
          this.viewState = 'list';
          this.refresh();
        },
        error: (err) => {
          console.error('Create error', err);
          this.loading = false;
        }
      });
    } else if (this.viewState === 'edit' && this.currentId) {
      const payload = { ...this.formModel };
      if (!payload.password) {
        delete payload.password; // Don't send empty password if not changing
      }
      this.userService.update(this.currentId, payload).subscribe({
        next: () => {
          this.viewState = 'list';
          this.refresh();
        },
        error: (err) => {
          console.error('Update error', err);
          this.loading = false;
        }
      });
    }
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.loading = true;
      this.userService.delete(id).subscribe({
        next: () => this.refresh(),
        error: (err) => {
          console.error('Delete error', err);
          this.loading = false;
        }
      })
    }
  }

  toggleEnabled(u: UserResponseDTO) {
    this.loading = true;
    this.userService.toggleEnabled(u.id).subscribe({
      next: () => {
        u.enabled = !u.enabled;
        this.loading = false;
      },
      error: (err) => {
        console.error('Toggle error', err);
        this.loading = false;
      }
    });
  }
}
