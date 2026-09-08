import { TestBed } from '@angular/core/testing';

import { StockEntry } from './stock-entry';

describe('StockEntry', () => {
  let service: StockEntry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockEntry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
