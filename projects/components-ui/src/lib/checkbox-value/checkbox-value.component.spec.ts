import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CheckboxValueComponent } from './checkbox-value.component';

describe('CheckboxValueComponent', (): void => {
  let component: CheckboxValueComponent;
  let fixture: ComponentFixture<CheckboxValueComponent>;

  beforeEach(waitForAsync((): void => {
    TestBed.configureTestingModule({
      declarations: [ CheckboxValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(CheckboxValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
