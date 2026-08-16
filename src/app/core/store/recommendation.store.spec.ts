import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RecommendationStore } from './recommendation.store';
import { Recommendation } from '../models/recommendation.model';

const trending: Recommendation = {
  id: 'r1', userId: 'u1', bookId: 'b1', score: 0.9, reason: 'trending', createdAt: ''
};
const personal: Recommendation = {
  id: 'r2', userId: 'u1', bookId: 'b2', score: 0.8, reason: 'similar_purchase', createdAt: ''
};

describe('RecommendationStore', () => {
  let store: InstanceType<typeof RecommendationStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RecommendationStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    store = TestBed.inject(RecommendationStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('has correct initial state', () => {
    expect(store.recommended()).toEqual([]);
    expect(store.trending()).toEqual([]);
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  describe('loadRecommendations()', () => {
    it('splits trending and personal recommendations', () => {
      store.loadRecommendations('u1');
      const req = httpMock.expectOne('/api/recommendations?userId=u1');
      req.flush([trending, personal]);
      expect(store.trending()).toEqual([trending]);
      expect(store.recommended()).toEqual([personal]);
    });

    it('sets error on failure', () => {
      store.loadRecommendations('u1');
      httpMock.expectOne('/api/recommendations?userId=u1').flush(
        { message: 'Error' }, { status: 500, statusText: 'Error' }
      );
      expect(store.error()).toBe('Error');
    });
  });

  describe('allRecommendations computed', () => {
    it('combines trending and recommended', () => {
      store.loadRecommendations('u1');
      httpMock.expectOne('/api/recommendations?userId=u1').flush([trending, personal]);
      expect(store.allRecommendations().length).toBe(2);
    });
  });
});
