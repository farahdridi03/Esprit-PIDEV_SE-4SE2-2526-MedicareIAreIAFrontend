import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ProductResponseDTO } from '../models/pharmacy.model';

describe('ProductService', () => {
    let service: ProductService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/products';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ProductService]
        });
        service = TestBed.inject(ProductService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all products', () => {
        const mockResponse: ProductResponseDTO[] = [{ id: 1, name: 'Product 1' }] as any;
        service.getAllProducts().subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should search products by name', () => {
        const mockResponse: ProductResponseDTO[] = [{ id: 1, name: 'Test' }] as any;
        service.searchProducts('Test').subscribe(res => {
            expect(res.length).toBe(1);
        });

        const req = httpMock.expectOne(req => req.url === `${apiUrl}/search` && req.params.get('name') === 'Test');
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });

    it('should get product by id', () => {
        const mockResponse: ProductResponseDTO = { id: 1, name: 'Product 1' } as any;
        service.getProductById(1).subscribe(res => {
            expect(res.id).toBe(1);
        });

        const req = httpMock.expectOne(`${apiUrl}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);
    });
});
