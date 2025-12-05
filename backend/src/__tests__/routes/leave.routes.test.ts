import Fastify, { FastifyInstance } from 'fastify';
import leaveRoutes from '../../routes/leave.routes';
import { LeaveService } from '../../services/LeaveService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/LeaveService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        leaveRequest: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe('Leave Routes', () => {
    let app: FastifyInstance;
    let mockLeaveService: jest.Mocked<LeaveService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(leaveRoutes, { prefix: '/api/leave' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockLeaveService = new LeaveService(prisma) as jest.Mocked<LeaveService>;
    });

    it('GET /api/leave should return 200 and list', async () => {
        const mockRequests = {
            data: [{ id: 1, status: 'pending' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };

        (LeaveService.prototype.getLeaveRequests as jest.Mock).mockResolvedValue(mockRequests);

        const response = await app.inject({
            method: 'GET',
            url: '/api/leave',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            ...mockRequests,
        });
    });

    it('POST /api/leave should return 200 and id', async () => {
        (LeaveService.prototype.createLeaveRequest as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'POST',
            url: '/api/leave',
            payload: {
                studentId: 1,
                courseId: 1,
                type: 'sick',
                reason: 'Flu',
                sessionIds: [1],
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            id: 1,
        });
    });

    it('PUT /api/leave/:id/status should return 200', async () => {
        (LeaveService.prototype.updateLeaveStatus as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'PUT',
            url: '/api/leave/1/status',
            payload: { status: 'approved' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });
});
