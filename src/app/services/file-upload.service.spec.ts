import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
    let service: FileUploadService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/upload';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [FileUploadService]
        });
        service = TestBed.inject(FileUploadService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should upload a file and return the response text', () => {
        const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
        const mockResponse = 'File uploaded successfully';

        service.uploadFile(mockFile).subscribe(response => {
            expect(response).toBe(mockResponse);
        });

        const req = httpMock.expectOne(apiUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body instanceof FormData).toBeTrue();
        expect(req.request.body.get('file')).toEqual(mockFile);
        req.flush(mockResponse);
    });
});
