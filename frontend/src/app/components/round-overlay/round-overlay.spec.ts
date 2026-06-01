import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundOverlay } from './round-overlay';

describe('RoundOverlay', () => {
  let component: RoundOverlay;
  let fixture: ComponentFixture<RoundOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
