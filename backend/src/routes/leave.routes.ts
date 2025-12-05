import { FastifyInstance } from 'fastify';
import { LeaveService } from '../services/LeaveService';
import { prisma } from '../lib/prisma';

export default async function leaveRoutes(fastify: FastifyInstance) {
    const leaveService = new LeaveService(prisma);

    fastify.get('/', async (request, reply) => {
        const filters = request.query as any;
        const result = await leaveService.getLeaveRequests(filters);
        return { success: true, ...result };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        const leave = await leaveService.createLeaveRequest(data);
        return { success: true, id: leave.id };
    });

    fastify.put('/:id/status', async (request, reply) => {
        const { id } = request.params as any;
        const { status, rejectionReason, reviewerId } = request.body as any;
        await leaveService.updateLeaveStatus(Number(id), status, Number(reviewerId), rejectionReason);
        return { success: true };
    });
}
