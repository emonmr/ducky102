export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

/** What the app keeps (and persists) for a signed-in user. */
export interface AuthSession {
  user: AuthUser;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

/** Shape returned by `auth/login` and `auth/register`. Mapped to `AuthSession` in AuthApiService. */
export interface AuthResponseDto {
  accessToken: string;
  user: { id: number; name: string; email: string };
}

/** Shape returned by `auth/forgot-password` and `auth/reset-password`. */
export interface MessageResponseDto {
  message: string;
}
