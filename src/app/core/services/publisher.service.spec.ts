import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PublisherService } from './publisher.service';
import { Publisher } from '../models/book.model';

const mockPublisher: Publisher = {
  id: 'p1',
  name: 'Penguin',
  country: 'UK',
  website: 'https://penguin.com'
};

describe('PublisherService', () => {
  let service: PublisherService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PublisherService]
    });
    service = TestBed.inject(PublisherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPublishers()', () => {
    it('GETs /api/publishers', () => {
      service.getPublishers().subscribe(pubs => {
        expect(pubs).toEqual([mockPublisher]);
      });
      const req = httpMock.expectOne('/api/publishers');
      expect(req.request.method).toBe('GET');
      req.flush([mockPublisher]);
    });
  });

  describe('getPublisherById()', () => {
    it('GETs /api/publishers/:id', () => {
      service.getPublisherById('p1').subscribe(pub => {
        expect(pub).toEqual(mockPublisher);
      });
      const req = httpMock.expectOne('/api/publishers/p1');
      expect(req.request.method).toBe('GET');
      req.flush(mockPublisher);
    });
  });
});
