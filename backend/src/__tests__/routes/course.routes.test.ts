import Fastify, { FastifyInstance } from 'fastify';
import courseRoutes from '../../routes/course.routes';
import { CourseService } from '../../services/CourseService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/CourseService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        course: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('Course Routes', () => {
    let app: FastifyInstance;
    let mockCourseService: jest.Mocked<CourseService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(courseRoutes, { prefix: '/api/courses' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup mock service instance
        mockCourseService = new CourseService(prisma) as jest.Mocked<CourseService>;
        // We need to ensure the route handler uses this mock. 
        // Since routes instantiate service internally or via DI, we might need to adjust how routes are defined to be testable with mocks.
        // For now, assuming we can mock the prototype or the module.
        // Actually, since we mocked the module '../../services/CourseService', the constructor should return our mock.
    });

    it('GET /api/courses should return 200 and list', async () => {
        const mockCourses = {
            data: [{ id: 1, name: 'Math' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };

        (CourseService.prototype.getCourses as jest.Mock).mockResolvedValue(mockCourses);

        const response = await app.inject({
            method: 'GET',
            url: '/api/courses',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            ...mockCourses,
        });
    });

    it('POST /api/courses should return 200 and id for Admin', async () => {
        const newCourse = { id: 1, name: 'Math' };
        (CourseService.prototype.createCourse as jest.Mock).mockResolvedValue(newCourse);

        // We need to simulate authentication. 
        // If we use fastify-jwt, we can inject a token or mock the verify function.
        // For this test, we'll assume the route handles auth.
        // If auth middleware is present, we need to mock it or pass a valid token.
        // Let's assume we pass a mock token header if needed, or mock the decorator.

        // TODO: Add auth mocking when auth middleware is integrated.
        // For now, testing the route logic assuming it passes auth or auth is mocked.

        const response = await app.inject({
            method: 'POST',
            url: '/api/courses',
            payload: {
                name: 'Math',
                teacherId: 1,
                classGroupId: 1,
                creatorId: 1
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            id: 1,
        });
    });
    describe('POST /api/courses/:id/enroll', () => {
        it('should enroll a student', async () => {
            const courseId = 1;
            const studentId = 1;
            const creatorId = 1; // Assuming mock user ID

            (CourseService.prototype.enrollStudent as jest.Mock).mockResolvedValue({
                id: 1,
                course_id: courseId,
                student_id: studentId,
                status: 'active',
                created_by: creatorId
            });

            const response = await app.inject({
                method: 'POST',
                url: `/api/courses/${courseId}/enroll`,
                payload: { student_ids: [studentId] },
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ success: true });
            expect(CourseService.prototype.enrollStudent).toHaveBeenCalledWith(courseId, studentId, expect.any(Number));
        });
    });

    describe('DELETE /api/courses/:id/enroll/:studentId', () => {
        it('should remove a student', async () => {
            const courseId = 1;
            const studentId = 1;

            (CourseService.prototype.removeStudent as jest.Mock).mockResolvedValue({ count: 1 });

            const response = await app.inject({
                method: 'DELETE',
                url: `/api/courses/${courseId}/enroll/${studentId}`,
            });

            expect(response.statusCode).toBe(200);
            expect(JSON.parse(response.payload)).toEqual({ success: true });
            expect(CourseService.prototype.removeStudent).toHaveBeenCalledWith(courseId, studentId);
        });
    });
});
