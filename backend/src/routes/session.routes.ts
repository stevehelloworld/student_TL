import { FastifyInstance } from 'fastify';
import { SessionService } from '../services/SessionService';
import { prisma } from '../lib/prisma';

export default async function sessionRoutes(fastify: FastifyInstance) {
    const sessionService = new SessionService(prisma);

    fastify.get('/', async (request, reply) => {
        const filters = request.query as any;
        const result = await sessionService.getSessions(filters);
        return { success: true, ...result };
    });

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const session = await sessionService.getSessionById(Number(id));
        if (!session) {
            return reply.status(404).send({ success: false, error: 'Session not found' });
        }
        return { success: true, data: session };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        const session = await sessionService.createSession(data);
        return { success: true, id: session.id };
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        await sessionService.updateSession(Number(id), data);
        return { success: true };
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as any;
        await sessionService.deleteSession(Number(id));
        return { success: true };
    });
}
