import { TestBed } from '@angular/core/testing';

import { AquaBoxService } from './aqua-box.service';

describe('AquaBoxService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AquaBoxService = TestBed.get(AquaBoxService);
    expect(service).toBeTruthy();
  });
});
