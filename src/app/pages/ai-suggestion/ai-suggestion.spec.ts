import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiSuggestion } from './ai-suggestion';

describe('AiSuggestion', () => {
  let component: AiSuggestion;
  let fixture: ComponentFixture<AiSuggestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiSuggestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiSuggestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
