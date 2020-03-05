import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsUiComponent } from './components-ui.component';

describe('ComponentsUiComponent', (): void => {
  let component: ComponentsUiComponent;
  let fixture: ComponentFixture<ComponentsUiComponent>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ ComponentsUiComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(ComponentsUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
