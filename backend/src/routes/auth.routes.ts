import { FastifyInstance } from 'fastify';
import { AuthService } from '../services/AuthService';
import { prisma } from '../lib/prisma';

export async function authRoutes(fastify: FastifyInstance) {
    const authService = new AuthService(prisma, process.env.JWT_SECRET || 'secret');

    fastify.post('/login', async (request, reply) => {
        const { username, password } = request.body as any;
        try {
            const result = await authService.login(username, password);
            return result;
        } catch (error: any) {
            console.error('Login error:', error);
            reply.status(401).send({ error: error.message });
        }
    });
}
