import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextareaValueComponent } from './textarea-value.component';

describe('TextareaValueComponent', (): void => {
  let component: TextareaValueComponent;
  let fixture: ComponentFixture<TextareaValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ TextareaValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TextareaValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
