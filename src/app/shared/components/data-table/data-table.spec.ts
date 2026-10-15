import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, TableColumn, TableRow } from './data-table';

const columns: TableColumn[] = [{ key: 'name', label: 'Name', sortable: true }];
const data: TableRow[] = [
  { id: 1, name: 'Charlie' },
  { id: 2, name: 'alice' },
  { id: 3, name: 'Bob' },
];

describe('DataTable', () => {
  let fixture: ComponentFixture<DataTable>;

  const renderedNames = () =>
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('tbody td')).map((td) =>
      td.textContent?.trim(),
    );
  const sortButton = () =>
    (fixture.nativeElement as HTMLElement).querySelector('th button') as HTMLButtonElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('data', data);
    await fixture.whenStable();
  });

  it('renders rows in input order until a column is sorted', () => {
    expect(renderedNames()).toEqual(['Charlie', 'alice', 'Bob']);
  });

  it('toggles ascending then descending sort on header click', async () => {
    sortButton().click();
    await fixture.whenStable();
    expect(renderedNames()).toEqual(['alice', 'Bob', 'Charlie']);

    sortButton().click();
    await fixture.whenStable();
    expect(renderedNames()).toEqual(['Charlie', 'Bob', 'alice']);
  });

  it('emits the row on click', () => {
    let clicked: TableRow | undefined;
    fixture.componentInstance.rowClick.subscribe((row) => (clicked = row));

    ((fixture.nativeElement as HTMLElement).querySelector('tbody tr') as HTMLElement).click();

    expect(clicked?.id).toBe(1);
  });
});
