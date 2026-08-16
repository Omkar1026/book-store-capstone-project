import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AddressService } from './address.service';
import { Address } from '../models/address.model';

const mockAddress: Address = {
  id: 'addr1',
  userId: 'u1',
  name: 'John',
  line1: '1 Main St',
  city: 'NY',
  state: 'NY',
  postcode: '10001',
  country: 'US',
  isDefault: true
};

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AddressService]
    });
    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAddressesByUserId()', () => {
    it('GETs /api/addresses?userId=u1', () => {
      service.getAddressesByUserId('u1').subscribe(addrs => {
        expect(addrs).toEqual([mockAddress]);
      });
      const req = httpMock.expectOne('/api/addresses?userId=u1');
      expect(req.request.method).toBe('GET');
      req.flush([mockAddress]);
    });
  });

  describe('getAddressById()', () => {
    it('GETs /api/addresses/:id', () => {
      service.getAddressById('addr1').subscribe(addr => {
        expect(addr).toEqual(mockAddress);
      });
      const req = httpMock.expectOne('/api/addresses/addr1');
      expect(req.request.method).toBe('GET');
      req.flush(mockAddress);
    });
  });

  describe('createAddress()', () => {
    it('POSTs to /api/addresses', () => {
      service.createAddress(mockAddress).subscribe(addr => {
        expect(addr).toEqual(mockAddress);
      });
      const req = httpMock.expectOne('/api/addresses');
      expect(req.request.method).toBe('POST');
      req.flush(mockAddress);
    });
  });

  describe('updateAddress()', () => {
    it('PATCHes /api/addresses/:id', () => {
      service.updateAddress('addr1', { city: 'LA' }).subscribe(addr => {
        expect(addr).toEqual(mockAddress);
      });
      const req = httpMock.expectOne('/api/addresses/addr1');
      expect(req.request.method).toBe('PATCH');
      req.flush(mockAddress);
    });
  });

  describe('deleteAddress()', () => {
    it('DELETEs /api/addresses/:id', () => {
      service.deleteAddress('addr1').subscribe();
      const req = httpMock.expectOne('/api/addresses/addr1');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
