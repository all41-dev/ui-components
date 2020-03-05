import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DateValueComponent } from './date-value.component';

describe('DateValueComponent', (): void => {
  let component: DateValueComponent;
  let fixture: ComponentFixture<DateValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ DateValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(DateValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
