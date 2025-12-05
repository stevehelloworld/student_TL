import { FastifyInstance } from 'fastify';
import { UserService } from '../services/UserService';
import { prisma } from '../lib/prisma';

export async function userRoutes(fastify: FastifyInstance) {
    const userService = new UserService(prisma);

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        try {
            const user = await userService.createUser(data);
            return { success: true, data: user };
        } catch (error: any) {
            reply.status(400).send({ error: error.message });
        }
    });

    fastify.get('/', async (request, reply) => {
        const { role } = request.query as any;
        const users = await userService.getUsers(role);
        return { success: true, data: users };
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        await userService.updateUser(Number(id), data);
        return { success: true };
    });

    fastify.delete('/:id', async (request, reply) => {
        const { id } = request.params as any;
        await userService.deleteUser(Number(id));
        return { success: true };
    });
}
