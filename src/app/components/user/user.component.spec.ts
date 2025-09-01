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

  // Integration Tests - Component + Service Interactions
  describe('Integration Tests - Component and Service', () => {
    describe('Complete User Workflow', () => {
      it('should load users, add a new user, edit it, and delete it', () => {
        // Setup initial data
        mockUserService.getUsers.and.returnValue(of(mockUsers));

        // Step 1: Load initial users
        component.ngOnInit();
        expect(component.users).toEqual(mockUsers);
        expect(component.users.length).toBe(2);

        // Step 2: Add a new user
        const newUserData = { name: 'Alice Johnson', email: 'alice@example.com' };
        const createdUser: User = { id: 3, name: 'Alice Johnson', email: 'alice@example.com' };
        component.newUser = newUserData;
        mockUserService.addUser.and.returnValue(of(createdUser));

        component.addUser();

        expect(mockUserService.addUser).toHaveBeenCalledWith(newUserData);
        expect(component.users).toContain(createdUser);
        expect(component.users.length).toBe(3);
        expect(component.newUser).toEqual({ name: '', email: '' });

        // Step 3: Edit the newly added user
        const updatedUserData = { name: 'Alice Updated', email: 'alice.updated@example.com' };
        const updatedUser: User = { id: 3, name: 'Alice Updated', email: 'alice.updated@example.com' };
        mockUserService.updateUser.and.returnValue(of(updatedUser));

        // Get the actual user from the component's array to edit
        const userToEdit = component.users.find(u => u.id === 3);
        expect(userToEdit).toBeDefined();

        component.editUser(userToEdit!);
        expect(component.isEditMode).toBeTrue();
        expect(component.editingUser?.id).toBe(3);
        expect(component.editingUser?.name).toBe('Alice Johnson');

        component.newUser = updatedUserData;
        component.addUser(); // This will trigger update in edit mode

        expect(mockUserService.updateUser).toHaveBeenCalledWith(3, updatedUserData);
        // Find the updated user in the array
        const updatedUserIndex = component.users.findIndex(u => u.id === 3);
        expect(component.users[updatedUserIndex]).toEqual(updatedUser);
        expect(component.isEditMode).toBeFalse();
        expect(component.users.length).toBe(3); // Should still be 3 after update

        // Step 4: Delete the user - use the updated user from the component's array
        spyOn(window, 'confirm').and.returnValue(true);
        mockUserService.deleteUser.and.returnValue(of(void 0));

        const userToDelete = component.users.find(u => u.id === 3);
        expect(userToDelete).toBeDefined(); // Ensure user exists
        component.deleteUser(userToDelete!);

        expect(mockUserService.deleteUser).toHaveBeenCalledWith(3);
        expect(component.users.find(u => u.id === 3)).toBeUndefined(); // User should be removed
        expect(component.users.length).toBe(2);
      });
    });

    describe('Service Error Handling Integration', () => {
      it('should handle service errors gracefully during user operations', () => {
        spyOn(console, 'error');

        // Test error during initial load
        mockUserService.getUsers.and.returnValue(throwError(() => new Error('Network error')));

        expect(() => component.ngOnInit()).not.toThrow();
        expect(console.error).toHaveBeenCalledWith('Error loading users:', jasmine.any(Error));

        // Test error during add
        component.newUser = { name: 'Test User', email: 'test@example.com' };
        mockUserService.addUser.and.returnValue(throwError(() => new Error('Add failed')));

        component.addUser();
        expect(console.error).toHaveBeenCalledWith('Error adding user:', jasmine.any(Error));

        // Test error during update
        component.isEditMode = true;
        component.editingUser = { id: 1, name: 'Test', email: 'test@example.com' };
        mockUserService.updateUser.and.returnValue(throwError(() => new Error('Update failed')));

        component.addUser();
        expect(console.error).toHaveBeenCalledWith('Error updating user:', jasmine.any(Error));

        // Test error during delete
        spyOn(window, 'confirm').and.returnValue(true);
        mockUserService.deleteUser.and.returnValue(throwError(() => new Error('Delete failed')));

        component.deleteUser(mockUsers[0]);
        expect(console.error).toHaveBeenCalledWith('Error deleting user:', jasmine.any(Error));
      });
    });

    describe('State Management Integration', () => {
      it('should maintain consistent state during multiple operations', () => {
        // Initialize with users
        mockUserService.getUsers.and.returnValue(of(mockUsers));
        component.ngOnInit();

        // Start editing a user
        component.editUser(mockUsers[0]);
        expect(component.isEditMode).toBeTrue();
        expect(component.editingUser).toEqual(mockUsers[0]);
        expect(component.newUser.name).toBe('John Doe');
        expect(component.newUser.email).toBe('john@example.com');

        // Cancel edit - state should be reset
        component.cancelEdit();
        expect(component.isEditMode).toBeFalse();
        expect(component.editingUser).toBeNull();
        expect(component.newUser).toEqual({ name: '', email: '' });

        // Try to add user with empty fields - should not call service
        component.addUser();
        expect(mockUserService.addUser).not.toHaveBeenCalled();
        expect(mockUserService.updateUser).not.toHaveBeenCalled();
      });

      it('should handle edit mode state correctly during operations', () => {
        // Setup initial state
        component.users = [...mockUsers];

        // Edit user
        component.editUser(mockUsers[0]);
        expect(component.isEditMode).toBeTrue();

        // Update user data
        component.newUser = { name: 'Updated John', email: 'john.updated@example.com' };
        const updatedUser: User = { id: 1, name: 'Updated John', email: 'john.updated@example.com' };
        mockUserService.updateUser.and.returnValue(of(updatedUser));

        // Perform update
        component.addUser();

        // Verify state is reset after successful update
        expect(component.isEditMode).toBeFalse();
        expect(component.editingUser).toBeNull();
        expect(component.newUser).toEqual({ name: '', email: '' });
        expect(component.users[0]).toEqual(updatedUser);
      });
    });

    describe('Service Call Sequencing', () => {
      it('should make service calls in correct order during complex operations', () => {
        const callOrder: string[] = [];

        mockUserService.getUsers.and.callFake(() => {
          callOrder.push('getUsers');
          return of(mockUsers);
        });

        mockUserService.addUser.and.callFake(() => {
          callOrder.push('addUser');
          return of({ id: 3, name: 'New User', email: 'new@example.com' });
        });

        mockUserService.updateUser.and.callFake(() => {
          callOrder.push('updateUser');
          return of({ id: 3, name: 'Updated User', email: 'updated@example.com' });
        });

        mockUserService.deleteUser.and.callFake(() => {
          callOrder.push('deleteUser');
          return of(void 0);
        });

        // Load users
        component.ngOnInit();

        // Add user
        component.newUser = { name: 'New User', email: 'new@example.com' };
        component.addUser();

        // Edit user
        const newUser = component.users[component.users.length - 1];
        component.editUser(newUser);
        component.newUser = { name: 'Updated User', email: 'updated@example.com' };
        component.addUser();

        // Delete user
        spyOn(window, 'confirm').and.returnValue(true);
        component.deleteUser(newUser);

        expect(callOrder).toEqual(['getUsers', 'addUser', 'updateUser', 'deleteUser']);
      });
    });

    describe('Data Consistency Tests', () => {
      it('should maintain data consistency between service responses and component state', () => {
        const initialUsers: User[] = [
          { id: 1, name: 'User 1', email: 'user1@example.com' },
          { id: 2, name: 'User 2', email: 'user2@example.com' }
        ];

        // Load initial users
        mockUserService.getUsers.and.returnValue(of(initialUsers));
        component.ngOnInit();
        expect(component.users).toEqual(initialUsers);

        // Add user and verify it's added to the correct position
        const newUser: User = { id: 3, name: 'User 3', email: 'user3@example.com' };
        component.newUser = { name: 'User 3', email: 'user3@example.com' };
        mockUserService.addUser.and.returnValue(of(newUser));

        component.addUser();
        expect(component.users.length).toBe(3);
        expect(component.users[2]).toEqual(newUser);

        // Update user and verify the correct user is updated
        const updatedUser: User = { id: 2, name: 'Updated User 2', email: 'updated2@example.com' };
        mockUserService.updateUser.and.returnValue(of(updatedUser));

        component.editUser(component.users[1]);
        component.newUser = { name: 'Updated User 2', email: 'updated2@example.com' };
        component.addUser();

        expect(component.users[1]).toEqual(updatedUser);
        expect(component.users[0].name).toBe('User 1'); // Other users unchanged
        expect(component.users[2].name).toBe('User 3');

        // Delete user and verify correct user is removed
        spyOn(window, 'confirm').and.returnValue(true);
        mockUserService.deleteUser.and.returnValue(of(void 0));

        component.deleteUser(component.users[1]);
        expect(component.users.length).toBe(2);
        expect(component.users.find(u => u.id === 2)).toBeUndefined();
        expect(component.users[0].name).toBe('User 1');
        expect(component.users[1].name).toBe('User 3');
      });
    });

    describe('Edge Cases Integration', () => {
      it('should handle service returning null or undefined gracefully', () => {
        // Test with null response
        mockUserService.getUsers.and.returnValue(of(null as any));
        expect(() => component.ngOnInit()).not.toThrow();

        // Test with undefined response
        mockUserService.getUsers.and.returnValue(of(undefined as any));
        expect(() => component.ngOnInit()).not.toThrow();
      });

      it('should handle concurrent operations correctly', () => {
        component.users = [...mockUsers];

        // Start editing a user
        component.editUser(mockUsers[0]);

        // Try to delete another user while in edit mode
        spyOn(window, 'confirm').and.returnValue(true);
        mockUserService.deleteUser.and.returnValue(of(void 0));

        component.deleteUser(mockUsers[1]);

        // Edit mode should still be active
        expect(component.isEditMode).toBeTrue();
        expect(component.editingUser).toEqual(mockUsers[0]);

        // But the other user should be deleted
        expect(component.users).not.toContain(mockUsers[1]);
      });
    });
  });
});
