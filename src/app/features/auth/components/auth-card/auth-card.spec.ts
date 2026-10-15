import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthCard } from './auth-card';

@Component({
  imports: [AuthCard],
  template: `
    <app-auth-card title="Sign in" subtitle="Welcome back">
      <p class="body">Form goes here</p>
      <p authFooter class="footer">Footer link</p>
    </app-auth-card>
  `,
})
class Host {}

describe('AuthCard', () => {
  let fixture: ComponentFixture<Host>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  it('renders the title and subtitle', () => {
    expect(el().querySelector('h1')?.textContent?.trim()).toBe('Sign in');
    expect(el().textContent).toContain('Welcome back');
  });

  it('projects the body into the card and the footer below it', () => {
    expect(el().querySelector('.card-body .body')).not.toBeNull();
    expect(el().querySelector('.card-body .footer')).toBeNull();
    expect(el().querySelector('.footer')).not.toBeNull();
  });
});
