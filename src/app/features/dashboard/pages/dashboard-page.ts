import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss'
})
export class DashboardPage {
  private route = inject(ActivatedRoute);

  profile = inject(ProfileService);
  
  group = this.route.snapshot.queryParamMap.get('group') ?? 'children';
  title = this.group === 'teenagers' ? 'Jóvenes lectores' : 'Pequeños exploradores';

  activities = [
    { icon: '✏️', name: 'Ortografía', text: 'Practica tildes y palabras.', path: '/spelling', color: '#e5a826' },
    { icon: '📖', name: 'Lectura', text: 'Lee y responde preguntas.', path: '/reading', color: '#0a7fab' },
    { icon: '📷', name: 'Realidad aumentada', text: 'Mira la lectura cobrar vida.', path: '/ar', color: '#d6457a' }
  ];
}