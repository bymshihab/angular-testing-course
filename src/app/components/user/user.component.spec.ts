import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { UserComponent } from './user.component';
import { UserService, User } from '../../services/user.service';

describe('UserComponent', () => {
  let component: UserComponent;
  let fixture: ComponentFixture<UserComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;

  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('UserService', ['getUsers', 'addUser', 'updateUser', 'deleteUser']);

    await TestBed.configureTestingModule({
      declarations: [UserComponent],
      imports: [
        FormsModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatButtonModule,
        MatInputModule,
        MatFormFieldModule,
        MatListModule,
        MatIconModule,
        MatDividerModule,
        MatTooltipModule
      ],
      providers: [
        { provide: UserService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserComponent);
    component = fixture.componentInstance;
    mockUserService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users on initialization', () => {
      mockUserService.getUsers.and.returnValue(of(mockUsers));

      component.ngOnInit();

      expect(mockUserService.getUsers).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
    });

    it('should handle empty users list', () => {
      mockUserService.getUsers.and.returnValue(of([]));

      component.ngOnInit();

      expect(component.users).toEqual([]);
    });
  });

  describe('addUser', () => {
    beforeEach(() => {
      component.newUser = { name: 'Test User', email: 'test@example.com' };
    });

    it('should add a new user successfully', () => {
      const newUser: User = { id: 3, name: 'Test User', email: 'test@example.com' };
      const expectedUserData = { name: 'Test User', email: 'test@example.com' };
      mockUserService.addUser.and.returnValue(of(newUser));
      component.users = [...mockUsers];

      component.addUser();

      expect(mockUserService.addUser).toHaveBeenCalledWith(expectedUserData);
      expect(component.users).toContain(newUser);
      expect(component.newUser).toEqual({ name: '', email: '' });
    });

    it('should not add user with empty name', () => {
      component.newUser.name = '';

      component.addUser();

      expect(mockUserService.addUser).not.toHaveBeenCalled();
    });

    it('should not add user with empty email', () => {
      component.newUser.email = '';

      component.addUser();

      expect(mockUserService.addUser).not.toHaveBeenCalled();
    });

    it('should handle add user error', () => {
      mockUserService.addUser.and.returnValue(throwError(() => new Error('Add failed')));
      spyOn(console, 'error');

      component.addUser();

      expect(console.error).toHaveBeenCalledWith('Error adding user:', jasmine.any(Error));
    });

    it('should update user when in edit mode', () => {
      const updatedUser: User = { id: 1, name: 'Updated User', email: 'updated@example.com' };
      const expectedUserData = { name: 'Test User', email: 'test@example.com' };
      component.isEditMode = true;
      component.editingUser = { id: 1, name: 'Old Name', email: 'old@example.com' };
      component.users = [...mockUsers];
      mockUserService.updateUser.and.returnValue(of(updatedUser));

      component.addUser();

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, expectedUserData);
      expect(component.users[0]).toEqual(updatedUser);
      expect(component.isEditMode).toBeFalse();
      expect(component.editingUser).toBeNull();
    });

    it('should handle update user error', () => {
      component.isEditMode = true;
      component.editingUser = { id: 1, name: 'Test', email: 'test@example.com' };
      mockUserService.updateUser.and.returnValue(throwError(() => new Error('Update failed')));
      spyOn(console, 'error');

      component.addUser();

      expect(console.error).toHaveBeenCalledWith('Error updating user:', jasmine.any(Error));
    });
  });

  describe('editUser', () => {
    it('should set edit mode and populate form', () => {
      const userToEdit = mockUsers[0];

      component.editUser(userToEdit);

      expect(component.isEditMode).toBeTrue();
      expect(component.editingUser).toEqual(userToEdit);
      expect(component.newUser.name).toBe(userToEdit.name);
      expect(component.newUser.email).toBe(userToEdit.email);
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      component.users = [...mockUsers];
    });

    it('should delete user when confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockUserService.deleteUser.and.returnValue(of(void 0));

      component.deleteUser(mockUsers[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete John Doe?');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(component.users).not.toContain(mockUsers[0]);
    });

    it('should not delete user when not confirmed', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteUser(mockUsers[0]);

      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
      expect(component.users).toContain(mockUsers[0]);
    });

    it('should not delete user without id', () => {
      const userWithoutId: User = { name: 'Test', email: 'test@example.com' };

      component.deleteUser(userWithoutId);

      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });

    it('should handle delete user error', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockUserService.deleteUser.and.returnValue(throwError(() => new Error('Delete failed')));
      spyOn(console, 'error');

      component.deleteUser(mockUsers[0]);

      expect(console.error).toHaveBeenCalledWith('Error deleting user:', jasmine.any(Error));
    });
  });

  describe('cancelEdit', () => {
    it('should reset edit mode and form', () => {
      component.isEditMode = true;
      component.editingUser = mockUsers[0];
      component.newUser = { name: 'Test', email: 'test@example.com' };

      component.cancelEdit();

      expect(component.isEditMode).toBeFalse();
      expect(component.editingUser).toBeNull();
      expect(component.newUser).toEqual({ name: '', email: '' });
    });
  });

  describe('getCardGradient', () => {
    it('should return different gradients for different indices', () => {
      const gradient0 = component.getCardGradient(0);
      const gradient1 = component.getCardGradient(1);

      expect(gradient0).toBeDefined();
      expect(gradient1).toBeDefined();
      expect(gradient0).not.toBe(gradient1);
    });

    it('should cycle through gradients when index exceeds array length', () => {
      const gradient0 = component.getCardGradient(0);
      const gradient6 = component.getCardGradient(6);

      expect(gradient0).toBe(gradient6);
    });
  });

  describe('getAvatarIcon', () => {
    it('should return different icons for different indices', () => {
      const icon0 = component.getAvatarIcon(0);
      const icon1 = component.getAvatarIcon(1);

      expect(icon0).toBeDefined();
      expect(icon1).toBeDefined();
      expect(icon0).not.toBe(icon1);
    });

    it('should cycle through icons when index exceeds array length', () => {
      const icon0 = component.getAvatarIcon(0);
      const icon6 = component.getAvatarIcon(6);

      expect(icon0).toBe(icon6);
    });
  });
});
