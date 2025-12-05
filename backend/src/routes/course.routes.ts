import { FastifyInstance } from 'fastify';
import { CourseService } from '../services/CourseService';
import { prisma } from '../lib/prisma';

export default async function courseRoutes(fastify: FastifyInstance) {
    const courseService = new CourseService(prisma);

    fastify.get('/', async (request, reply) => {
        const filters = request.query as any;
        const result = await courseService.getCourses(filters);
        return { success: true, ...result };
    });

    fastify.post('/', async (request, reply) => {
        const data = request.body as any;
        const course = await courseService.createCourse(data);
        return { success: true, id: course.id };
    });

    fastify.get('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const course = await courseService.getCourseById(Number(id));
        if (!course) {
            return reply.status(404).send({ success: false, error: 'Course not found' });
        }
        return { success: true, data: course };
    });

    fastify.put('/:id', async (request, reply) => {
        const { id } = request.params as any;
        const data = request.body as any;
        await courseService.updateCourse(Number(id), data);
        return { success: true };
    });
    fastify.post<{ Body: { student_ids: number[] }, Params: { id: number } }>('/:id/enroll', async (request, reply) => {
        const courseId = Number(request.params.id);
        const { student_ids } = request.body;
        // TODO: Get creatorId from auth token
        const creatorId = 1;

        for (const studentId of student_ids) {
            await courseService.enrollStudent(courseId, studentId, creatorId);
        }
        return { success: true };
    });

    fastify.delete<{ Params: { id: number, studentId: number } }>('/:id/enroll/:studentId', async (request, reply) => {
        const courseId = Number(request.params.id);
        const studentId = Number(request.params.studentId);
        await courseService.removeStudent(courseId, studentId);
        return { success: true };
    });
}
