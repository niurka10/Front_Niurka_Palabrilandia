import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatMessage } from '../models/assistant.models';
import { AssistantService } from '../services/assistant.service';

@Component({
  selector: 'app-assistant-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant-page.html',
  styleUrl: './assistant-page.scss'
})
export class AssistantPage {
  private service = inject(AssistantService);
  private route = inject(ActivatedRoute);

  group = this.route.snapshot.queryParamMap.get('group') === 'teenagers' ? 'teenagers' : 'children';

  question = '';
  sending = signal(false);
  finished = signal(false);


  messages = signal<ChatMessage[]>([
    { from: 'bot', text: '¡Hola! Soy tu asistente de Lengua y Literatura. Pregúntame, por ejemplo: «¿Cuándo se usa la tilde?»' }
  ]);

  suggestions = ['¿Cuándo se usa la tilde?', '¿Cuándo uso por qué y porque?', '¿Qué es una oración?', '¿Cuándo uso mayúscula?'];

  send(text?: string): void {
    if(this.finished()) return;
    const q = (text ?? this.question).trim();
    

    this.messages.update(m => [...m, { from: 'user', text: q }]);
    this.question = '';
    this.sending.set(true);

    this.service.ask(q, this.group).subscribe({
      next: r => {
        this.messages.update(m => [...m, {from: 'bot', text: r.answer }]);
        this.sending.set(false);
        const bye = ['fin', 'adiós', 'adions', 'chao', 'gracias'];
        if (bye.some(w => q.toLowerCase().split(/\s+/).includes(w))) this.finished.set(true);
      }
    });
  }


  endChat(): void {
    this.messages.update(m => [
      ...m,
      {
        from: 'bot', text: this.group === 'teenagers'
          ? '¡Hasta pronto! Sigue practicando ortografía y lectura.'
          : '¡Chao! Lo hiciste muy bien. ¡Vuelve a practicar pronto!'
      }
    ]);
    this.finished.set(true);
  }

  newChat(): void {
    this.messages.set([
      { from: 'bot', text: '¡Hola! Soy tu asistente de Lengua y Literatura. Pregúntame, por ejemplo: «¿Cuándo se usa la tilde?»' }
    ]);
    this.question = '';
    this.finished.set(false);
  }
}