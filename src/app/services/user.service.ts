import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id?: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http: HttpClient) {}

  getUsers(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(this.apiUrl));
  }

  addUser(user: User): Promise<User> {
    return firstValueFrom(this.http.post<User>(this.apiUrl, user));
  }

  updateUser(id: number, user: User): Promise<User> {
    return firstValueFrom(this.http.put<User>(`${this.apiUrl}/${id}`, user));
  }

  deleteUser(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  getUserById(id: number): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.apiUrl}/${id}`));
  }
}
