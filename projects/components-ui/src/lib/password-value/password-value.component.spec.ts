import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordValueComponent } from './password-value.component';

describe('PasswordValueComponent', (): void => {
  let component: PasswordValueComponent;
  let fixture: ComponentFixture<PasswordValueComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ PasswordValueComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(PasswordValueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
