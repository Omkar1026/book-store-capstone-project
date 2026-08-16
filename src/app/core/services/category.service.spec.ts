import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { BookCategory } from '../models/book.model';

const mockCategory: BookCategory = {
  id: 'c1',
  name: 'Fiction',
  slug: 'fiction',
  description: 'Fiction books'
};

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CategoryService]
    });
    service = TestBed.inject(CategoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getCategories()', () => {
    it('GETs /api/categories', () => {
      service.getCategories().subscribe(cats => {
        expect(cats).toEqual([mockCategory]);
      });
      const req = httpMock.expectOne('/api/categories');
      expect(req.request.method).toBe('GET');
      req.flush([mockCategory]);
    });
  });

  describe('getCategoryById()', () => {
    it('GETs /api/categories/:id', () => {
      service.getCategoryById('c1').subscribe(cat => {
        expect(cat).toEqual(mockCategory);
      });
      const req = httpMock.expectOne('/api/categories/c1');
      expect(req.request.method).toBe('GET');
      req.flush(mockCategory);
    });
  });
});
