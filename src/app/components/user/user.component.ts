import { Component, OnInit } from '@angular/core';
import { User, UserService } from '../../services/user.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  users: User[] = [];
  newUser: User = { name: '', email: '' };
  editingUser: User | null = null;
  isEditMode: boolean = false;

  constructor(private userService: UserService) {}

  async ngOnInit() {
    this.users = await this.userService.getUsers();
  }

  async addUser() {
    if (!this.newUser.name || !this.newUser.email) return;

    try {
      if (this.isEditMode && this.editingUser?.id) {
        // Update existing user
        const updated = await this.userService.updateUser(this.editingUser.id, this.newUser);
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index !== -1) {
          this.users[index] = updated;
        }
        this.cancelEdit();
      } else {
        // Add new user
        const created = await this.userService.addUser(this.newUser);
        this.users.push(created);
        this.resetForm();
      }
    } catch (error) {
      console.error('Error saving user:', error);
      // You can add user-friendly error handling here
    }
  }

  editUser(user: User) {
    this.editingUser = { ...user };
    this.newUser = { name: user.name, email: user.email };
    this.isEditMode = true;
  }

  async deleteUser(user: User) {
    if (!user.id) return;

    const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);
    if (!confirmed) return;

    try {
      await this.userService.deleteUser(user.id);
      this.users = this.users.filter(u => u.id !== user.id);
    } catch (error) {
      console.error('Error deleting user:', error);
      // You can add user-friendly error handling here
    }
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingUser = null;
    this.resetForm();
  }

  private resetForm() {
    this.newUser = { name: '', email: '' };
  }

  getCardGradient(index: number): string {
    const gradients = [
      'bg-gradient-to-br from-rose-100 via-pink-100 to-red-100',
      'bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100',
      'bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100',
      'bg-gradient-to-br from-green-100 via-emerald-100 to-lime-100',
      'bg-gradient-to-br from-yellow-100 via-amber-100 to-orange-100',
      'bg-gradient-to-br from-gray-100 via-slate-100 to-zinc-100'
    ];
    return gradients[index % gradients.length];
  }

  getAvatarIcon(index: number): string {
    const icons = ['person', 'face', 'account_circle', 'supervisor_account', 'badge', 'contact_mail'];
    return icons[index % icons.length];
  }
}
