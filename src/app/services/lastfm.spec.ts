import { TestBed } from '@angular/core/testing';

import { LastFmService } from './lastfm.service';

describe('Lastfm', () => {
  let service: LastFmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LastFmService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
