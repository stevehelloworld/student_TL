import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ClassGroupService } from '../services/ClassGroupService';

import { prisma } from '../lib/prisma';
const classGroupService = new ClassGroupService(prisma);

export async function classGroupRoutes(fastify: FastifyInstance) {
    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        try {
            const classGroup = await classGroupService.createClassGroup(data);
            return { success: true, data: classGroup };
        } catch (error: any) {
            reply.status(400).send({ error: error.message });
        }
    });

    fastify.get('/', async (request, reply) => {
        const { page, limit } = request.query as any;
        const classes = await classGroupService.getClassGroups({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined
        });
        return { success: true, data: classes.data, pagination: classes.pagination };
    });

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const classGroup = await classGroupService.getClassGroupById(Number(id));
        if (!classGroup) {
            return reply.status(404).send({ error: 'Class group not found' });
        }
        return { success: true, data: classGroup };
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        try {
            const classGroup = await classGroupService.updateClassGroup(Number(id), data);
            return { success: true, data: classGroup };
        } catch (error: any) {
            reply.status(400).send({ error: error.message });
        }
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as any;
        try {
            await classGroupService.deleteClassGroup(Number(id));
            return { success: true };
        } catch (error: any) {
            reply.status(400).send({ error: error.message });
        }
    });
}
