import { FastifyInstance } from 'fastify';
import { NotificationService } from '../services/NotificationService';
import { prisma } from '../lib/prisma';

export default async function notificationRoutes(fastify: FastifyInstance) {
    const notificationService = new NotificationService(prisma);

    fastify.get('/', async (request, reply) => {
        const { unreadOnly } = request.query as any;
        // TODO: Get userId from auth token
        const userId = 1;
        const notifications = await notificationService.getNotifications(userId, unreadOnly === 'true');
        return { success: true, data: notifications };
    });

    fastify.put('/:id/read', async (request, reply) => {
        const { id } = request.params as any;
        await notificationService.markAsRead(Number(id));
        return { success: true };
    });

    fastify.put('/read-all', async (request, reply) => {
        // TODO: Get userId from auth token
        const userId = 1;
        await notificationService.markAllAsRead(userId);
        return { success: true };
    });
}
