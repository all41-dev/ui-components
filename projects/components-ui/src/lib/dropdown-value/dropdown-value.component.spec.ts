import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownValueComponent } from './dropdown-value.component';

describe('DropdownValueComponent', (): void => {
  let component: DropdownValueComponent;
  let fixture: ComponentFixture<DropdownValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ DropdownValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(DropdownValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
