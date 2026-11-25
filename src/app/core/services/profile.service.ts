import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  // Claves con las que se guarda todo en el navegador (nunca en el servidor)
  private readonly KEY = 'palabrilandia.nickname';
  private readonly STARS = 'palabrilandia.stars';
  private readonly DONE = 'palabrilandia.done';

  nickname = signal<string>(this.read(this.KEY));
  stars = signal<number>(Number(this.read(this.STARS)) || 0);   // estrellas ganadas
  done = signal<number>(Number(this.read(this.DONE)) || 0);     // actividades terminadas

  // Lee un valor guardado (si el navegador no deja, devuelve vacío)
  private read(key: string): string {
    try { return localStorage.getItem(key) ?? ''; } catch { return ''; }
  }

  // Guarda un valor en el navegador
  private write(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* sin almacenamiento */ }
  }

  // Limpia el apodo: solo letras, números y espacios, máximo 15
  save(name: string): void {
    const clean = name.replace(/[^\p{L}\p{N} ]/gu, '').trim().slice(0, 15);
    this.nickname.set(clean);
    this.write(this.KEY, clean);
  }

  // Se llama al terminar una actividad: suma estrellas y una actividad hecha
  addProgress(stars: number): void {
    this.stars.update(v => v + stars);
    this.done.update(v => v + 1);
    this.write(this.STARS, String(this.stars()));
    this.write(this.DONE, String(this.done()));
  }

  // Borra apodo y progreso del dispositivo
  clear(): void {
    this.nickname.set('');
    this.stars.set(0);
    this.done.set(0);
    try {
      localStorage.removeItem(this.KEY);
      localStorage.removeItem(this.STARS);
      localStorage.removeItem(this.DONE);
    } catch { /* nada */ }
  }
}