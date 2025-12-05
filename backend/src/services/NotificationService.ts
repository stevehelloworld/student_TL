import { PrismaClient, Notification } from '@prisma/client';

interface CreateNotificationData {
    userId: number;
    title: string;
    content: string;
    type: string;
}

export class NotificationService {
    constructor(private prisma: PrismaClient) { }

    async createNotification(data: CreateNotificationData): Promise<Notification> {
        return this.prisma.notification.create({
            data: {
                user_id: data.userId,
                title: data.title,
                content: data.content,
                type: data.type,
            },
        });
    }

    async getNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
        const where: any = { user_id: userId };
        if (unreadOnly) {
            where.is_read = false;
        }

        return this.prisma.notification.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });
    }

    async markAsRead(id: number): Promise<Notification> {
        return this.prisma.notification.update({
            where: { id },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });
    }

    async markAllAsRead(userId: number): Promise<Prisma.BatchPayload> {
        return this.prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: {
                is_read: true,
                read_at: new Date(),
            },
        });
    }
}

import { Prisma } from '@prisma/client';
