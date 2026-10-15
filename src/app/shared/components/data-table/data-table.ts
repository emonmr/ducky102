import { Component, computed, input, output, signal } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export type TableRow = Record<string, unknown> & { id: string | number };
export type SortDirection = 'asc' | 'desc';

/** Presentational Bootstrap table with client-side, signal-based sorting. */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  readonly columns = input.required<TableColumn[]>();
  readonly data = input.required<TableRow[]>();
  readonly selectedId = input<TableRow['id'] | null>(null);
  readonly rowClick = output<TableRow>();

  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDir = signal<SortDirection>('asc');

  protected readonly sortedData = computed(() => {
    const key = this.sortKey();
    const rows = this.data();
    if (!key) return rows;
    const direction = this.sortDir() === 'asc' ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        String(a[key] ?? '').localeCompare(String(b[key] ?? ''), undefined, { numeric: true }) *
        direction,
    );
  });

  protected toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(key: string): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }
}
