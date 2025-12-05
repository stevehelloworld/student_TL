import Fastify, { FastifyInstance } from 'fastify';
import attendanceRoutes from '../../routes/attendance.routes';
import { AttendanceService } from '../../services/AttendanceService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/AttendanceService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        attendanceRecord: {
            findMany: jest.fn(),
            count: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

describe('Attendance Routes', () => {
    let app: FastifyInstance;
    let mockAttendanceService: jest.Mocked<AttendanceService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(attendanceRoutes, { prefix: '/api/attendance' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockAttendanceService = new AttendanceService(prisma) as jest.Mocked<AttendanceService>;
    });

    it('GET /api/attendance should return 200 and list', async () => {
        const mockAttendance = {
            data: [{ id: 1, status: 'present' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };

        (AttendanceService.prototype.getAttendance as jest.Mock).mockResolvedValue(mockAttendance);

        const response = await app.inject({
            method: 'GET',
            url: '/api/attendance',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            ...mockAttendance,
        });
    });

    it('POST /api/attendance should return 200 and success', async () => {
        (AttendanceService.prototype.markAttendance as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'POST',
            url: '/api/attendance',
            payload: {
                sessionId: 1,
                studentId: 1,
                status: 'present',
                note: 'On time',
                creatorId: 1
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });
});
