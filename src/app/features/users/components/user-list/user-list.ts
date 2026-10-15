import { Component, computed, inject, OnInit } from '@angular/core';
import {
  DataTable,
  TableColumn,
  TableRow,
} from '../../../../shared/components/data-table/data-table';
import { UsersStore } from '../../state/users.store';
import { UserCard } from '../user-card/user-card';
import { UserDetail } from '../user-detail/user-detail';

@Component({
  selector: 'app-user-list',
  imports: [UserCard, UserDetail, DataTable],
  templateUrl: './user-list.html',
})
export class UserList implements OnInit {
  protected readonly store = inject(UsersStore);

  protected readonly columns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'company', label: 'Company', sortable: true },
    { key: 'city', label: 'City', sortable: true },
  ];

  protected readonly rows = computed<TableRow[]>(() =>
    this.store.filteredUsers().map((user) => ({ ...user })),
  );

  ngOnInit(): void {
    this.store.loadUsers();
  }

  protected onRowClick(row: TableRow): void {
    if (typeof row.id === 'number') this.store.selectUser(row.id);
  }
}
