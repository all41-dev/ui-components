import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeaheadValueComponent } from './typeahead-value.component';

describe('TypeaheadValueComponent', (): void => {
  let component: TypeaheadValueComponent;
  let fixture: ComponentFixture<TypeaheadValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ TypeaheadValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(TypeaheadValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
