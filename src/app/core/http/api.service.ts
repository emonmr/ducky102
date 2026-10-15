import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type QueryParams = Record<
  string,
  string | number | boolean | readonly (string | number | boolean)[]
>;

/**
 * Base HTTP pattern for the app. Feature API services wrap this instead of using HttpClient
 * directly, so the base URL and request conventions live in one place.
 */
@Service()
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: QueryParams): Observable<T> {
    return this.http.get<T>(this.url(path), {
      params: params && new HttpParams({ fromObject: params }),
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(this.url(path), body);
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(this.url(path), body);
  }

  delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(this.url(path));
  }

  /** Absolute URL for a path — use with `httpResource()` for simple reactive GETs. */
  url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`;
  }
}
