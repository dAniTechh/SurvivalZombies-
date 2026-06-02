import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoundOverlayComponent } from './round-overlay';

describe('RoundOverlay', () => {
  let component: RoundOverlayComponent;
  let fixture: ComponentFixture<RoundOverlayComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundOverlayComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundOverlayComponent);

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
