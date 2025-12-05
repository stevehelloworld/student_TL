import { FastifyInstance } from 'fastify';
import { AttendanceService } from '../services/AttendanceService';
import { prisma } from '../lib/prisma';

export default async function attendanceRoutes(fastify: FastifyInstance) {
    const attendanceService = new AttendanceService(prisma);

    fastify.get('/', async (request, reply) => {
        const query = request.query as any;
        const filters = {
            ...query,
            studentId: query.studentId ? Number(query.studentId) : undefined,
            sessionId: query.sessionId ? Number(query.sessionId) : undefined,
            page: query.page ? Number(query.page) : undefined,
            limit: query.limit ? Number(query.limit) : undefined,
        };
        const result = await attendanceService.getAttendance(filters);
        return { success: true, ...result };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        // TODO: Get creatorId from auth token
        data.creatorId = 1;
        await attendanceService.markAttendance(data);
        return { success: true };
    });
}
