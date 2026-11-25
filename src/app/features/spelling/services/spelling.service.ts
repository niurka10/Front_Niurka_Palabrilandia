import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckAnswerResponse, SpellingExercise } from '../models/spelling.models';

@Injectable({
  providedIn: 'root'
})
export class SpellingService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:7292/api/Spelling';

getExercises(group: string): Observable<SpellingExercise[]> {
  return this.http.get<SpellingExercise[]>(`${this.baseUrl}/exercises`, { params: { group } });
}

  check(id: number, answer: string): Observable<CheckAnswerResponse> {
    return this.http.post<CheckAnswerResponse>(
      `${this.baseUrl}/exercises/${id}/check`,
      { answer }
    );
  }
}