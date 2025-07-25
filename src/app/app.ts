import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `
    <div style="text-align:center; margin-top: 20px;">
      <h1>API Last.fm - Búsqueda de Artistas</h1>
      <input [(ngModel)]="artist" placeholder="Nombre del artista" />
      <button (click)="buscarArtista()">Buscar</button>

      <div *ngIf="resultado">
        <h2>Resultado:</h2>
        <pre>{{ resultado | json }}</pre>
      </div>
    </div>
  `
})
export class AppComponent {
  private http = inject(HttpClient);
  artist: string = '';
  resultado: any;

  private API_KEY = '03ac5e67ccb398ec2895c9323167cc62';

  buscarArtista() {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.search&artist=${this.artist}&api_key=${this.API_KEY}&format=json`;

    this.http.get(url).subscribe(data => {
      this.resultado = data;
    });
  }
}
