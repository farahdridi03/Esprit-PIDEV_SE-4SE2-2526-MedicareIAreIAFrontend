import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PharmacyService } from './pharmacy.service';
import { PharmacyResponseDTO, PharmacyStockResponseDTO } from '../models/pharmacy.model';

describe('PharmacyService', () => {
    let service: PharmacyService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/pharmacies';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [PharmacyService]
        });
        service = TestBed.inject(PharmacyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all pharmacies', () => {
        const mockResponse: PharmacyResponseDTO[] = [{ id: 1, name: 'Pharma 1' }] as any;
        service.getAllPharmacies().subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should get pharmacy by id', () => {
        const mockResponse: PharmacyResponseDTO = { id: 1, name: 'Pharma 1' } as any;
        service.getPharmacyById(1).subscribe(res => {
            expect(res.id).toBe(1);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should search pharmacies by name', () => {
        const mockResponse: PharmacyResponseDTO[] = [{ id: 1, name: 'Test' }] as any;
        service.searchPharmacies('Test').subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(req => req.url === `${apiUrl}/search` && req.params.get('name') === 'Test');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should search by product and city', () => {
        const mockResponse: PharmacyStockResponseDTO[] = [{ id: 1, pharmacyName: 'P1' }] as any;
        service.searchByProduct(10, 'Tunis', 5).subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(req => 
            req.url === `${apiUrl}/search/product` && 
            req.params.get('productId') === '10' &&
            req.params.get('city') === 'Tunis' &&
            req.params.get('minQty') === '5'
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should search by batch of products', () => {
        const mockResponse: PharmacyStockResponseDTO[] = [{ id: 1, pharmacyName: 'P1' }] as any;
        service.searchByProducts([1, 2, 3], 10).subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(req => 
            req.url === `${apiUrl}/search/batch` && 
            req.params.get('productIds') === '1,2,3' &&
            req.params.get('minQty') === '10'
        );
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });
});
