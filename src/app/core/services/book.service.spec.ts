import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BookService } from './book.service';
import { Book } from '../models/book.model';

const mockBook: Book = {
  id: 'b1',
  title: 'Test Book',
  author: 'Author',
  publisherId: 'p1',
  categoryId: 'c1',
  price: 9.99,
  stock: 5,
  imageUrl: '',
  rating: 4.5,
  reviewCount: 10,
  description: 'A test book',
  isbn: '1234567890',
  publishedDate: '2024-01-01',
  tags: []
};

describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookService]
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getBooks()', () => {
    it('GETs /api/books with no params', () => {
      service.getBooks().subscribe(books => {
        expect(books).toEqual([mockBook]);
      });
      const req = httpMock.expectOne('/api/books');
      expect(req.request.method).toBe('GET');
      req.flush([mockBook]);
    });

    it('GETs /api/books with query params', () => {
      service.getBooks({ q: 'test', _page: 1, _limit: 12 }).subscribe();
      const req = httpMock.expectOne(r => r.url === '/api/books');
      expect(req.request.params.get('q')).toBe('test');
      expect(req.request.params.get('_page')).toBe('1');
      expect(req.request.params.get('_limit')).toBe('12');
      req.flush([]);
    });

    it('does not include undefined params', () => {
      service.getBooks({ q: undefined, _page: 1 }).subscribe();
      const req = httpMock.expectOne(r => r.url === '/api/books');
      expect(req.request.params.has('q')).toBeFalse();
      req.flush([]);
    });
  });

  describe('getBookById()', () => {
    it('GETs /api/books/:id', () => {
      service.getBookById('b1').subscribe(book => {
        expect(book).toEqual(mockBook);
      });
      const req = httpMock.expectOne('/api/books/b1');
      expect(req.request.method).toBe('GET');
      req.flush(mockBook);
    });
  });
});
