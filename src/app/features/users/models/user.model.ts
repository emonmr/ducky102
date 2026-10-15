export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: string;
  city: string;
  isActive: boolean;
}

/** Shape returned by the backend (JSONPlaceholder `/users`). Mapped to `User` in UserApiService. */
export interface UserDto {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: { name: string };
  address: { city: string };
}
