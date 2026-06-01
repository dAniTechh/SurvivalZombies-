import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameCanvasComponent } from './game-canvas'; 

describe('GameCanvasComponent', () => {
  let component: GameCanvasComponent; 
  let fixture: ComponentFixture<GameCanvasComponent>; 

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameCanvasComponent], 
    }).compileComponents();

    fixture = TestBed.createComponent(GameCanvasComponent); 
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});