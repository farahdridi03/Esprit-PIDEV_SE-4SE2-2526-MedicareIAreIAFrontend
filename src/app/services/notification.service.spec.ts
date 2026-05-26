import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NotificationService } from '../services/notification.service';
import { NotificationResponseDTO, NotificationType } from '../models/notification.model';

describe('NotificationService', () => {
    let service: NotificationService;
    let httpMock: HttpTestingController;
    const apiUrl = 'http://localhost:8081/springsecurity/api/pharmacy/notifications';

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [NotificationService]
        });
        service = TestBed.inject(NotificationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getNotifications', () => {
        it('should fetch notifications for user', () => {
            const mockNotifications: NotificationResponseDTO[] = [
                {
                    id: 1,
                    userId: 1,
                    title: 'Test',
                    message: 'Test message',
                    type: NotificationType.ORDER_CREATED,
                    isRead: false,
                    createdAt: '2026-03-28T12:32:46Z'
                }
            ];

            service.getNotifications(1).subscribe(notifications => {
                expect(notifications.length).toBe(1);
                expect(notifications[0].type).toBe(NotificationType.ORDER_CREATED);
            });

            const req = httpMock.expectOne(`${apiUrl}/user/1`);
            expect(req.request.method).toBe('GET');
            req.flush(mockNotifications);
        });
    });

    describe('notifications$ observable', () => {
        it('should emit notifications when data is fetched', (done) => {
            const mockNotifications: NotificationResponseDTO[] = [
                {
                    id: 1,
                    userId: 1,
                    title: 'Test',
                    message: 'Test message',
                    type: NotificationType.NEW_HOMECARE_REQUEST,
                    isRead: false,
                    createdAt: '2026-03-28T12:32:46Z'
                }
            ];

            service.notifications$.subscribe(notifications => {
                if (notifications.length > 0) {
                    expect(notifications[0].type).toBe(NotificationType.NEW_HOMECARE_REQUEST);
                    done();
                }
            });

            service.getNotifications(1).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/user/1`);
            req.flush(mockNotifications);
        });
    });

    describe('unreadCount$ observable', () => {
        it('should update unread count', (done) => {
            const mockNotifications: NotificationResponseDTO[] = [
                {
                    id: 1,
                    userId: 1,
                    title: 'Test',
                    message: 'Test message',
                    type: NotificationType.ORDER_CREATED,
                    isRead: false,
                    createdAt: '2026-03-28T12:32:46Z'
                },
                {
                    id: 2,
                    userId: 1,
                    title: 'Test 2',
                    message: 'Test message 2',
                    type: NotificationType.PAYMENT_CONFIRMED,
                    isRead: true,
                    createdAt: '2026-03-28T12:32:46Z'
                }
            ];

            service.unreadCount$.subscribe(count => {
                if (count > 0) {
                    expect(count).toBe(1); // Only unread
                    done();
                }
            });

            service.getNotifications(1).subscribe();

            const req = httpMock.expectOne(`${apiUrl}/user/1`);
            req.flush(mockNotifications);
        });
    });

    describe('addNotification', () => {
        it('should add notification to list', (done) => {
            const newNotif: NotificationResponseDTO = {
                id: 1,
                userId: 1,
                title: 'New Notification',
                message: 'Alert message',
                type: NotificationType.NEW_HOMECARE_REQUEST,
                isRead: false,
                createdAt: '2026-03-28T12:32:46Z'
            };

            service.notifications$.subscribe(notifications => {
                if (notifications.length > 0) {
                    expect(notifications[0].title).toBe('New Notification');
                    done();
                }
            });

            service.addNotification(newNotif);
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', () => {
            const mockResponse: NotificationResponseDTO = {
                id: 1,
                userId: 1,
                title: 'Test',
                message: 'Test message',
                type: NotificationType.ORDER_CREATED,
                isRead: true,
                createdAt: '2026-03-28T12:32:46Z'
            };

            service.markAsRead(1).subscribe(response => {
                expect(response.isRead).toBe(true);
            });

            const req = httpMock.expectOne(`${apiUrl}/1/read`);
            expect(req.request.method).toBe('PATCH');
            req.flush(mockResponse);
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read for user', () => {
            service.markAllAsRead(1).subscribe(() => {
                expect(true).toBeTruthy();
            });

            const req = httpMock.expectOne(`${apiUrl}/user/1/read-all`);
            expect(req.request.method).toBe('PATCH');
            req.flush({});
        });
    });

    describe('getUnreadCount', () => {
        it('should fetch unread count for user', () => {
            service.getUnreadCount(1).subscribe(response => {
                expect(response.unreadCount).toBe(3);
            });

            const req = httpMock.expectOne(`${apiUrl}/user/1/count`);
            expect(req.request.method).toBe('GET');
            req.flush({ unreadCount: 3 });
        });
    });
});
