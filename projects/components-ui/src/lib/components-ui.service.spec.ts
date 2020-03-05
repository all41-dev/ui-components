import { TestBed, inject } from '@angular/core/testing';

import { ComponentsUiService } from './components-ui.service';

describe('ComponentsUiService', (): void => {
  beforeEach((): void => {
    TestBed.configureTestingModule({
      providers: [ComponentsUiService]
    });
  });

  it('should be created', inject([ComponentsUiService], (service: ComponentsUiService): void => {
    expect(service).toBeTruthy();
  }));
});
