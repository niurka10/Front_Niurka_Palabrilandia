import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AskResponse } from '../models/assistant.models';

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5073/api/assistant';

  ask(question: string, group: string): Observable<AskResponse> {
    return this.http.post<AskResponse>(`${this.baseUrl}/ask`, { question, group });
  }
}