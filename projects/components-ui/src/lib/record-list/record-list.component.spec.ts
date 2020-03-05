import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordListComponent } from './record-list.component';

describe('RecordListComponent', (): void => {
  let component: RecordListComponent<any>;
  let fixture: ComponentFixture<RecordListComponent<any>>;

  beforeEach(async((): void => {
    TestBed.configureTestingModule({
      declarations: [ RecordListComponent ]
    })
      .compileComponents();
  }));

  beforeEach((): void => {
    fixture = TestBed.createComponent(RecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', (): void => {
    expect(component).toBeTruthy();
  });
});
