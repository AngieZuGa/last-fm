// src/app/app.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LastFmService, LastFmArtist, LastFmArtistInfo } from './services/lastfm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <header class="header">
        <h1>🎵 Last.fm Explorer</h1>
        <p>Descubre artistas, álbumes y canciones</p>
      </header>

      <div class="search-section">
        <div class="search-box">
          <input 
            [(ngModel)]="searchTerm" 
            placeholder="Buscar artista..." 
            (keyup.enter)="buscarArtistas()"
            [disabled]="isLoading()"
          />
          <button 
            (click)="buscarArtistas()" 
            [disabled]="!searchTerm.trim() || isLoading()"
          >
            {{ isLoading() ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
      </div>

      @if (errorMessage()) {
        <div class="error-message">
          <p>❌ {{ errorMessage() }}</p>
        </div>
      }

      @if (searchResults().length > 0) {
        <div class="results-section">
          <h2>Resultados de búsqueda</h2>
          <div class="artists-grid">
            @for (artist of searchResults(); track artist.name) {
              <div class="artist-card" (click)="seleccionarArtista(artist.name)">
                <div class="artist-image">
                  @if (getArtistImage(artist)) {
                    <img [src]="getArtistImage(artist)" [alt]="artist.name" />
                  } @else {
                    <div class="no-image">🎤</div>
                  }
                </div>
                <div class="artist-info">
                  <h3>{{ artist.name }}</h3>
                  <p>{{ artist.listeners | number }} oyentes</p>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (selectedArtistInfo()) {
        <div class="artist-detail">
          <div class="artist-header">
            <div class="artist-image-large">
              @if (getSelectedArtistImage()) {
                <img [src]="getSelectedArtistImage()" [alt]="selectedArtistInfo()!.artist.name" />
              } @else {
                <div class="no-image">🎤</div>
              }
            </div>
            <div class="artist-details">
              <h2>{{ selectedArtistInfo()!.artist.name }}</h2>
              <div class="stats">
                <span class="stat">
                  👥 {{ selectedArtistInfo()!.artist.stats.listeners | number }} oyentes
                </span>
                <span class="stat">
                  ▶️ {{ selectedArtistInfo()!.artist.stats.playcount | number }} reproducciones
                </span>
              </div>
              
              @if (selectedArtistInfo()!.artist.tags.tag.length > 0) {
                <div class="tags">
                  @for (tag of selectedArtistInfo()!.artist.tags.tag.slice(0, 5); track tag.name) {
                    <span class="tag">{{ tag.name }}</span>
                  }
                </div>
              }
              
              <a [href]="selectedArtistInfo()!.artist.url" target="_blank" class="lastfm-link">
                Ver en Last.fm 🔗
              </a>
            </div>
          </div>

          @if (selectedArtistInfo()!.artist.bio.summary) {
            <div class="bio">
              <h3>Biografía</h3>
              <p [innerHTML]="getCleanBio(selectedArtistInfo()!.artist.bio.summary)"></p>
            </div>
          }

          <div class="actions">
            <button (click)="cargarTopTracks()" [disabled]="isLoadingTracks()">
              {{ isLoadingTracks() ? 'Cargando...' : 'Ver Top Tracks' }}
            </button>
            <button (click)="cargarTopAlbums()" [disabled]="isLoadingAlbums()">
              {{ isLoadingAlbums() ? 'Cargando...' : 'Ver Top Álbumes' }}
            </button>
          </div>

          @if (topTracks().length > 0) {
            <div class="tracks-section">
              <h3>🎵 Top Tracks</h3>
              <div class="tracks-list">
                @for (track of topTracks(); track track.name) {
                  <div class="track-item">
                    <span class="track-name">{{ track.name }}</span>
                    <span class="track-playcount">{{ track.playcount | number }} plays</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (topAlbums().length > 0) {
            <div class="albums-section">
              <h3>💿 Top Álbumes</h3>
              <div class="albums-grid">
                @for (album of topAlbums(); track album.name) {
                  <div class="album-item">
                    <div class="album-image">
                      @if (getAlbumImage(album)) {
                        <img [src]="getAlbumImage(album)" [alt]="album.name" />
                      } @else {
                        <div class="no-image">💿</div>
                      }
                    </div>
                    <div class="album-info">
                      <h4>{{ album.name }}</h4>
                      <p>{{ album.playcount | number }} plays</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
    }

    .header h1 {
      color: #d51007;
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .header p {
      color: #666;
      font-size: 1.1rem;
    }

    .search-section {
      display: flex;
      justify-content: center;
      margin-bottom: 40px;
    }

    .search-box {
      display: flex;
      gap: 10px;
      width: 100%;
      max-width: 500px;
    }

    .search-box input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #ddd;
      border-radius: 8px;
      font-size: 16px;
    }

    .search-box input:focus {
      outline: none;
      border-color: #d51007;
    }

    .search-box button {
      padding: 12px 24px;
      background-color: #d51007;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .search-box button:hover:not(:disabled) {
      background-color: #b00e06;
    }

    .search-box button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      text-align: center;
      color: #c00;
    }

    .results-section h2 {
      color: #333;
      margin-bottom: 20px;
    }

    .artists-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .artist-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .artist-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .artist-image {
      width: 100%;
      height: 150px;
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .artist-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      font-size: 3rem;
      color: #999;
    }

    .artist-info {
      padding: 16px;
    }

    .artist-info h3 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .artist-info p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .artist-detail {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
      margin-top: 40px;
    }

    .artist-header {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }

    .artist-image-large {
      width: 200px;
      height: 200px;
      background-color: #f5f5f5;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .artist-image-large img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .artist-image-large .no-image {
      font-size: 4rem;
    }

    .artist-details {
      flex: 1;
    }

    .artist-details h2 {
      margin: 0 0 16px 0;
      color: #333;
      font-size: 2rem;
    }

    .stats {
      display: flex;
      gap: 20px;
      margin-bottom: 16px;
    }

    .stat {
      background-color: #f8f9fa;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      color: #666;
    }

    .tags {
      margin-bottom: 16px;
    }

    .tag {
      display: inline-block;
      background-color: #d51007;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      margin-right: 8px;
      margin-bottom: 8px;
    }

    .lastfm-link {
      color: #d51007;
      text-decoration: none;
      font-weight: bold;
    }

    .lastfm-link:hover {
      text-decoration: underline;
    }

    .bio {
      margin-bottom: 30px;
    }

    .bio h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .bio p {
      line-height: 1.6;
      color: #666;
    }

    .actions {
      display: flex;
      gap: 16px;
      margin-bottom: 30px;
    }

    .actions button {
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .actions button:hover:not(:disabled) {
      background-color: #0056b3;
    }

    .actions button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .tracks-section, .albums-section {
      margin-bottom: 30px;
    }

    .tracks-section h3, .albums-section h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .tracks-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .track-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }

    .track-name {
      font-weight: 500;
      color: #333;
    }

    .track-playcount {
      color: #666;
      font-size: 0.9rem;
    }

    .albums-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 16px;
    }

    .album-item {
      text-align: center;
    }

    .album-image {
      width: 100%;
      height: 150px;
      background-color: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .album-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .album-info h4 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 0.9rem;
    }

    .album-info p {
      margin: 0;
      color: #666;
      font-size: 0.8rem;
    }

    @media (max-width: 768px) {
      .artist-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .artist-image-large {
        width: 150px;
        height: 150px;
      }

      .stats {
        flex-direction: column;
        gap: 8px;
      }

      .actions {
        flex-direction: column;
      }
    }
  `]
})
export class AppComponent {
  private lastFmService = inject(LastFmService);

  searchTerm = '';
  searchResults = signal<LastFmArtist[]>([]);
  selectedArtistInfo = signal<LastFmArtistInfo | null>(null);
  topTracks = signal<any[]>([]);
  topAlbums = signal<any[]>([]);
  isLoading = signal(false);
  isLoadingTracks = signal(false);
  isLoadingAlbums = signal(false);
  errorMessage = signal<string | null>(null);

  buscarArtistas() {
    if (!this.searchTerm.trim()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.selectedArtistInfo.set(null);
    this.topTracks.set([]);
    this.topAlbums.set([]);

    this.lastFmService.searchArtists(this.searchTerm).subscribe({
      next: (response) => {
        this.searchResults.set(response.results.artistmatches.artist || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al buscar artistas: ' + error.message);
        this.isLoading.set(false);
        this.searchResults.set([]);
      }
    });
  }

  seleccionarArtista(artistName: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.topTracks.set([]);
    this.topAlbums.set([]);

    this.lastFmService.getArtistInfo(artistName).subscribe({
      next: (response) => {
        this.selectedArtistInfo.set(response);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al obtener información del artista: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  cargarTopTracks() {
    const artist = this.selectedArtistInfo();
    if (!artist) return;

    this.isLoadingTracks.set(true);
    this.lastFmService.getTopTracks(artist.artist.name).subscribe({
      next: (response) => {
        this.topTracks.set(response.toptracks.track || []);
        this.isLoadingTracks.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar top tracks: ' + error.message);
        this.isLoadingTracks.set(false);
      }
    });
  }

  cargarTopAlbums() {
    const artist = this.selectedArtistInfo();
    if (!artist) return;

    this.isLoadingAlbums.set(true);
    this.lastFmService.getTopAlbums(artist.artist.name).subscribe({
      next: (response) => {
        this.topAlbums.set(response.topalbums.album || []);
        this.isLoadingAlbums.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar top álbumes: ' + error.message);
        this.isLoadingAlbums.set(false);
      }
    });
  }

  getArtistImage(artist: LastFmArtist): string | null {
    const largeImage = artist.image.find(img => img.size === 'large' || img.size === 'extralarge');
    return largeImage?.['#text'] || null;
  }

  getSelectedArtistImage(): string | null {
    const artist = this.selectedArtistInfo();
    if (!artist) return null;
    const largeImage = artist.artist.image.find(img => img.size === 'large' || img.size === 'extralarge');
    return largeImage?.['#text'] || null;
  }

  getAlbumImage(album: any): string | null {
    const largeImage = album.image?.find((img: any) => img.size === 'large' || img.size === 'extralarge');
    return largeImage?.['#text'] || null;
  }

  getCleanBio(bio: string): string {
    // Remover enlaces de Last.fm del final de la biografía
    return bio.replace(/<a href.*?<\/a>/g, '').trim();
  }
}