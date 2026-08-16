import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { HomePageComponent } from './home-page.component';
import { AuthStore } from '../../core/store/auth.store';
import { RecommendationStore } from '../../core/store/recommendation.store';
import { CartStore } from '../../core/store/cart.store';

describe('HomePageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const mockAuthStore = {
      isAuthenticated: signal(false),
      currentUser: signal(null),
      isLoading: signal(false),
      error: signal(null),
      hydrate: jasmine.createSpy('hydrate')
    };

    const mockRecommendationStore = {
      isLoading: signal(false),
      error: signal(null),
      recommended: signal([]),
      trending: signal([]),
      loadRecommendations: jasmine.createSpy('loadRecommendations')
    };

    const mockCartStore = {
      cart: signal(null),
      items: signal([]),
      itemCount: signal(0),
      totalPrice: signal(0),
      isLoading: signal(false),
      error: signal(null),
      addItem: jasmine.createSpy('addItem')
    };

    TestBed.configureTestingModule({
      imports: [HomePageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: RecommendationStore, useValue: mockRecommendationStore },
        { provide: CartStore, useValue: mockCartStore }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates the component', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls loadTrending, loadCategories, loadPublishers on ngOnInit', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    fixture.componentInstance.ngOnInit();

    const booksReq = httpMock.expectOne(r => r.url === '/api/books');
    booksReq.flush([]);
    const catsReq = httpMock.expectOne('/api/categories');
    catsReq.flush([]);
    const pubsReq = httpMock.expectOne('/api/publishers');
    pubsReq.flush([]);
  });

  it('does not call loadRecommendations when user is unauthenticated', () => {
    const fixture = TestBed.createComponent(HomePageComponent);
    const recStore = TestBed.inject(RecommendationStore) as any;
    fixture.componentInstance.ngOnInit();

    httpMock.expectOne(r => r.url === '/api/books').flush([]);
    httpMock.expectOne('/api/categories').flush([]);
    httpMock.expectOne('/api/publishers').flush([]);

    expect(recStore.loadRecommendations).not.toHaveBeenCalled();
  });
});
