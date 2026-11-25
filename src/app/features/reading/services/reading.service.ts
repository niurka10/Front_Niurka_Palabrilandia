import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CheckAnswerResponse } from '../../spelling/models/spelling.models';
import { ReadingText } from '../models/reading.models';

@Injectable({ providedIn: 'root' })
export class ReadingService {
  private http = inject(HttpClient);
private baseUrl = 'http://localhost:5073/api/reading';

  getTexts(group: string): Observable<ReadingText[]> {
    return this.http.get<ReadingText[]>(`${this.baseUrl}/texts`, { params: { group } });
  }

  check(questionId: number, answer: string): Observable<CheckAnswerResponse> {
    return this.http.post<CheckAnswerResponse>(`${this.baseUrl}/questions/${questionId}/check`, { answer });
  }
}