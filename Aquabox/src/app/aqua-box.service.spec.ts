import { TestBed } from '@angular/core/testing';

import { AquaBoxService } from './aqua-box.service';

describe('AquaBoxService', () => {
  let service: AquaBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AquaBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
