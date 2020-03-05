import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnComponent } from './column.component';

describe('ColumnComponent', (): void => {
  let component: ColumnComponent;
  let fixture: ComponentFixture<ColumnComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ ColumnComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
