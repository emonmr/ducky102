import { inject, Service } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { User, UserDto } from '../models/user.model';

@Service()
export class UserApiService {
  private readonly api = inject(ApiService);

  getAll(): Observable<User[]> {
    return this.api.get<UserDto[]>('users').pipe(map((dtos) => dtos.map(toUser)));
  }

  delete(id: User['id']): Observable<void> {
    return this.api.delete(`users/${id}`);
  }
}

function toUser(dto: UserDto): User {
  return {
    id: dto.id,
    name: dto.name,
    username: dto.username,
    email: dto.email,
    phone: dto.phone,
    website: dto.website,
    company: dto.company.name,
    city: dto.address.city,
    // The demo API has no status field; derive one so the UI has something to show.
    isActive: dto.id % 4 !== 0,
  };
}
