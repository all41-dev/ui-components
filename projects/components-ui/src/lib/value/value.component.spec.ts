import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueComponent } from './value.component';

describe('ValueComponent', (): void => {
  let component: ValueComponent;
  let fixture: ComponentFixture<ValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ ValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
