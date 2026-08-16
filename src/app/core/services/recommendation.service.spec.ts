import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RecommendationService } from './recommendation.service';
import { Recommendation } from '../models/recommendation.model';

const mockRec: Recommendation = {
  id: 'r1',
  userId: 'u1',
  bookId: 'b1',
  score: 0.9,
  reason: 'trending',
  createdAt: '2024-01-01T00:00:00Z'
};

describe('RecommendationService', () => {
  let service: RecommendationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RecommendationService]
    });
    service = TestBed.inject(RecommendationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRecommendationsByUserId()', () => {
    it('GETs /api/recommendations?userId=u1', () => {
      service.getRecommendationsByUserId('u1').subscribe(recs => {
        expect(recs).toEqual([mockRec]);
      });
      const req = httpMock.expectOne('/api/recommendations?userId=u1');
      expect(req.request.method).toBe('GET');
      req.flush([mockRec]);
    });
  });
});
