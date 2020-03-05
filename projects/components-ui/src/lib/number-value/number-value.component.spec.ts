import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberValueComponent } from './number-value.component';

describe('NumberValueComponent', (): void => {
  let component: NumberValueComponent;
  let fixture: ComponentFixture<NumberValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ NumberValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(NumberValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
