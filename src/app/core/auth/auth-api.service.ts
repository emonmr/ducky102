import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../http/api.service';
import {
  AuthResponseDto,
  AuthSession,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponseDto,
  RegisterRequest,
  ResetPasswordRequest,
} from './auth.model';

@Service()
export class AuthApiService {
  private readonly api = inject(ApiService);

  login(credentials: LoginRequest): Observable<AuthSession> {
    return this.api.post<AuthResponseDto>('auth/login', credentials).pipe(map(toSession));
  }

  register(request: RegisterRequest): Observable<AuthSession> {
    return this.api.post<AuthResponseDto>('auth/register', request).pipe(map(toSession));
  }

  /** Resolves to the server's confirmation message. */
  forgotPassword(request: ForgotPasswordRequest): Observable<string> {
    return this.api
      .post<MessageResponseDto>('auth/forgot-password', request)
      .pipe(map((res) => res.message));
  }

  /** Resolves to the server's confirmation message. */
  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.api
      .post<MessageResponseDto>('auth/reset-password', request)
      .pipe(map((res) => res.message));
  }
}

function toSession(dto: AuthResponseDto): AuthSession {
  return {
    token: dto.accessToken,
    user: { id: dto.user.id, name: dto.user.name, email: dto.user.email },
  };
}
