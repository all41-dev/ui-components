import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordComponent } from './record.component';

describe('RecordComponent', (): void => {
  let component: RecordComponent<any>;
  let fixture: ComponentFixture<RecordComponent<any>>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ RecordComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
