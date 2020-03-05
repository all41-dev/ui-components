import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextValueComponent } from './text-value.component';

describe('TextValueComponent', (): void => {
  let component: TextValueComponent;
  let fixture: ComponentFixture<TextValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ TextValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TextValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
