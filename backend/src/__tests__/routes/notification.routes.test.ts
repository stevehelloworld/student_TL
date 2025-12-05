import Fastify, { FastifyInstance } from 'fastify';
import notificationRoutes from '../../routes/notification.routes';
import { NotificationService } from '../../services/NotificationService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/NotificationService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        notification: {
            findMany: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

describe('Notification Routes', () => {
    let app: FastifyInstance;
    let mockNotificationService: jest.Mocked<NotificationService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(notificationRoutes, { prefix: '/api/notifications' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockNotificationService = new NotificationService(prisma) as jest.Mocked<NotificationService>;
    });

    it('GET /api/notifications should return 200 and list', async () => {
        const mockNotifications = [{ id: 1, title: 'Test' }];
        (NotificationService.prototype.getNotifications as jest.Mock).mockResolvedValue(mockNotifications);

        const response = await app.inject({
            method: 'GET',
            url: '/api/notifications',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            data: mockNotifications,
        });
    });

    it('PUT /api/notifications/:id/read should return 200', async () => {
        (NotificationService.prototype.markAsRead as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'PUT',
            url: '/api/notifications/1/read',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });

    it('PUT /api/notifications/read-all should return 200', async () => {
        (NotificationService.prototype.markAllAsRead as jest.Mock).mockResolvedValue({ count: 5 });

        const response = await app.inject({
            method: 'PUT',
            url: '/api/notifications/read-all',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });
});
