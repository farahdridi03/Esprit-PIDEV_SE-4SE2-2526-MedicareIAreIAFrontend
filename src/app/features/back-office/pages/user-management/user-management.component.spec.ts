import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { UserManagementComponent } from './user-management.component';
import { UserService } from '../../../../services/user.service';
import { UserResponseDTO } from '../../../../models/user.model';

describe('UserManagementComponent', () => {
  let component: UserManagementComponent;
  let fixture: ComponentFixture<UserManagementComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getAll', 'getByRole', 'create', 'update', 'delete', 'toggleEnabled']);

    await TestBed.configureTestingModule({
      declarations: [UserManagementComponent],
      imports: [HttpClientTestingModule, FormsModule],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    
    // Default mock response for refresh
    userServiceSpy.getAll.and.returnValue(of([]));
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should refresh users list on init', () => {
    const mockUsers: UserResponseDTO[] = [{ id: 1, fullName: 'User 1', email: 'u1@u1.com', role: 'PATIENT', enabled: true }];
    userServiceSpy.getAll.and.returnValue(of(mockUsers));
    
    component.ngOnInit();
    
    expect(userServiceSpy.getAll).toHaveBeenCalled();
    expect(component.users.length).toBe(1);
    expect(component.users[0].fullName).toBe('User 1');
  });

  it('should filter by role', () => {
    userServiceSpy.getByRole.and.returnValue(of([]));
    component.filterRole = 'DOCTOR';
    
    component.refresh();
    
    expect(userServiceSpy.getByRole).toHaveBeenCalledWith('DOCTOR');
  });

  it('should change viewState to add', () => {
    component.viewAdd();
    expect(component.viewState).toBe('add');
    expect(component.currentId).toBeNull();
  });

  it('should change viewState to edit and populate form', () => {
    const user: UserResponseDTO = { id: 5, fullName: 'Edit Me', email: 'edit@e.com', role: 'ADMIN', enabled: true };
    component.viewEdit(user);
    expect(component.viewState).toBe('edit');
    expect(component.currentId).toBe(5);
    expect(component.formModel.fullName).toBe('Edit Me');
  });

  it('should call userService.create when saving in add mode', () => {
    component.viewState = 'add';
    component.formModel = { fullName: 'New', email: 'new@n.com', role: 'PATIENT', password: 'pwd', phone: '', birthDate: '' };
    userServiceSpy.create.and.returnValue(of({} as any));
    userServiceSpy.getAll.and.returnValue(of([])); // for refresh

    component.saveUser();

    expect(userServiceSpy.create).toHaveBeenCalledWith(component.formModel);
    expect(component.viewState).toBe('list');
  });

  it('should call userService.update when saving in edit mode', () => {
    component.viewState = 'edit';
    component.currentId = 10;
    component.formModel = { fullName: 'Update', email: 'up@u.com', role: 'ADMIN', password: '', phone: '', birthDate: '' };
    userServiceSpy.update.and.returnValue(of({} as any));
    userServiceSpy.getAll.and.returnValue(of([])); // for refresh

    component.saveUser();

    expect(userServiceSpy.update).toHaveBeenCalled();
    expect(component.viewState).toBe('list');
  });

  it('should call userService.delete when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    userServiceSpy.delete.and.returnValue(of(undefined));
    userServiceSpy.getAll.and.returnValue(of([])); // for refresh

    component.deleteUser(1);

    expect(userServiceSpy.delete).toHaveBeenCalledWith(1);
  });

  it('should call userService.toggleEnabled', () => {
    const user: UserResponseDTO = { id: 1, fullName: 'U1', email: 'u1@u1.com', role: 'PATIENT', enabled: false };
    userServiceSpy.toggleEnabled.and.returnValue(of(undefined));

    component.toggleEnabled(user);

    expect(userServiceSpy.toggleEnabled).toHaveBeenCalledWith(1);
    expect(user.enabled).toBeTrue();
  });
});
