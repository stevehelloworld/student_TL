import { NotificationService } from '../../services/NotificationService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        notification: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('NotificationService', () => {
    let notificationService: NotificationService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        notificationService = new NotificationService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createNotification', () => {
        it('should create a notification', async () => {
            const data = {
                userId: 1,
                title: 'Test Notification',
                content: 'This is a test',
                type: 'info',
            };

            const createdNotification = {
                id: 1,
                user_id: data.userId,
                title: data.title,
                content: data.content,
                type: data.type,
                is_read: false,
                created_at: new Date(),
            };

            (mockPrisma.notification.create as jest.Mock).mockResolvedValue(createdNotification);

            const result = await notificationService.createNotification(data);

            expect(mockPrisma.notification.create).toHaveBeenCalledWith({
                data: {
                    user_id: data.userId,
                    title: data.title,
                    content: data.content,
                    type: data.type,
                },
            });
            expect(result).toEqual(createdNotification);
        });
    });

    describe('getNotifications', () => {
        it('should return notifications for a user', async () => {
            const userId = 1;
            const notifications = [{ id: 1, title: 'Test' }];

            (mockPrisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

            const result = await notificationService.getNotifications(userId);

            expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' },
            });
            expect(result).toEqual(notifications);
        });

        it('should return only unread notifications', async () => {
            const userId = 1;
            const notifications = [{ id: 1, title: 'Test', is_read: false }];

            (mockPrisma.notification.findMany as jest.Mock).mockResolvedValue(notifications);

            const result = await notificationService.getNotifications(userId, true);

            expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
                where: { user_id: userId, is_read: false },
                orderBy: { created_at: 'desc' },
            });
            expect(result).toEqual(notifications);
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            const id = 1;
            const updatedNotification = { id, is_read: true, read_at: new Date() };

            (mockPrisma.notification.update as jest.Mock).mockResolvedValue(updatedNotification);

            const result = await notificationService.markAsRead(id);

            expect(mockPrisma.notification.update).toHaveBeenCalledWith({
                where: { id },
                data: { is_read: true, read_at: expect.any(Date) },
            });
            expect(result).toEqual(updatedNotification);
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications for a user as read', async () => {
            const userId = 1;
            const updateResult = { count: 5 };

            (mockPrisma.notification.updateMany as jest.Mock).mockResolvedValue(updateResult);

            const result = await notificationService.markAllAsRead(userId);

            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: { user_id: userId, is_read: false },
                data: { is_read: true, read_at: expect.any(Date) },
            });
            expect(result).toEqual(updateResult);
        });
    });
});
