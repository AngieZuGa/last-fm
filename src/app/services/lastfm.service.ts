// src/app/services/lastfm.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface LastFmArtist {
  name: string;
  mbid: string;
  url: string;
  image: Array<{
    '#text': string;
    size: string;
  }>;
  streamable: string;
  listeners: string;
}

export interface LastFmArtistSearchResponse {
  results: {
    'opensearch:Query': any;
    'opensearch:totalResults': string;
    'opensearch:startIndex': string;
    'opensearch:itemsPerPage': string;
    artistmatches: {
      artist: LastFmArtist[];
    };
  };
}

export interface LastFmArtistInfo {
  artist: {
    name: string;
    mbid: string;
    url: string;
    image: Array<{
      '#text': string;
      size: string;
    }>;
    streamable: string;
    ontour: string;
    stats: {
      listeners: string;
      playcount: string;
    };
    similar: {
      artist: Array<{
        name: string;
        url: string;
        image: Array<{
          '#text': string;
          size: string;
        }>;
      }>;
    };
    tags: {
      tag: Array<{
        name: string;
        url: string;
      }>;
    };
    bio: {
      links: {
        link: {
          '#text': string;
          rel: string;
          href: string;
        };
      };
      published: string;
      summary: string;
      content: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class LastFmService {
  private http = inject(HttpClient);
  private readonly API_KEY = '03ac5e67ccb398ec2895c9323167cc62';
  private readonly BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

  searchArtists(artistName: string, limit: number = 10): Observable<LastFmArtistSearchResponse> {
    const params = new HttpParams({
      fromObject: {
        method: 'artist.search',
        artist: artistName,
        api_key: this.API_KEY,
        format: 'json',
        limit: limit.toString()
      }
    });

    return this.http.get<LastFmArtistSearchResponse>(this.BASE_URL, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getArtistInfo(artistName: string): Observable<LastFmArtistInfo> {
    const params = new HttpParams({
      fromObject: {
        method: 'artist.getinfo',
        artist: artistName,
        api_key: this.API_KEY,
        format: 'json'
      }
    });

    return this.http.get<LastFmArtistInfo>(this.BASE_URL, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTopTracks(artistName: string, limit: number = 10): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        method: 'artist.gettoptracks',
        artist: artistName,
        api_key: this.API_KEY,
        format: 'json',
        limit: limit.toString()
      }
    });

    return this.http.get(this.BASE_URL, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  getTopAlbums(artistName: string, limit: number = 10): Observable<any> {
    const params = new HttpParams({
      fromObject: {
        method: 'artist.gettopalbums',
        artist: artistName,
        api_key: this.API_KEY,
        format: 'json',
        limit: limit.toString()
      }
    });

    return this.http.get(this.BASE_URL, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: any) {
    console.error('Error en la API de Last.fm:', error);
    let errorMessage = 'Ocurrió un error desconocido';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}