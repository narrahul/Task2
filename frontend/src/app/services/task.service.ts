import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskFilters } from '../models/task.model';
import { environment } from '../../environments/environment';  // ✅ import environment

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiUrl;   // ✅ use environment variable

  constructor(private http: HttpClient) { }

  getTasks(filters?: TaskFilters): Observable<Task[]> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key as keyof TaskFilters];
        if (value && value.toString().trim() !== '') {
          params = params.set(key, value.toString().trim());
        }
      });
    }

    return this.http.get<Task[]>(`${this.apiUrl}/tasks`, { params });
  }

  createTask(task: Omit<Task, 'id' | 'date_created'>): Observable<Task> {
    return this.http.post<Task>(`${this.apiUrl}/tasks`, task);
  }

  updateTask(taskId: number, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/tasks/${taskId}`, task);
  }

  updateTaskStatus(taskId: number, status: 'open' | 'closed'): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/tasks/${taskId}/status`, { status });
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tasks/${taskId}`);
  }

  getTaskTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/task-types`);
  }

  getContactPersons(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/contact-persons`);
  }
}
