import { FastifyInstance } from 'fastify';
import { ParentService } from '../services/ParentService';
import { prisma } from '../lib/prisma';

export default async function parentRoutes(fastify: FastifyInstance) {
    const parentService = new ParentService(prisma);

    fastify.get('/students/:studentId/parents', async (request, reply) => {
        const { studentId } = request.params as any;
        const parents = await parentService.getParents(Number(studentId));
        return { success: true, data: parents };
    });

    fastify.post('/students/:studentId/parents', async (request, reply) => {
        const { studentId } = request.params as any;
        const data = request.body as any;
        // TODO: Get createdBy from auth token
        data.createdBy = 1;
        data.studentId = Number(studentId);
        const parent = await parentService.addParent(data);
        return { success: true, id: parent.id };
    });

    fastify.put('/parents/:id', async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        // TODO: Get updatedBy from auth token
        data.updatedBy = 1;
        await parentService.updateParent(Number(id), data);
        return { success: true };
    });

    fastify.delete('/parents/:id', async (request, reply) => {
        const { id } = request.params as any;
        await parentService.deleteParent(Number(id));
        return { success: true };
    });
}
