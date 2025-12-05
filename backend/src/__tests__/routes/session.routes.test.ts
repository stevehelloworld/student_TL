import Fastify, { FastifyInstance } from 'fastify';
import sessionRoutes from '../../routes/session.routes';
import { SessionService } from '../../services/SessionService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/SessionService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        session: {
            findMany: jest.fn(),
            count: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Session Routes', () => {
    let app: FastifyInstance;
    let mockSessionService: jest.Mocked<SessionService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(sessionRoutes, { prefix: '/api/sessions' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionService = new SessionService(prisma) as jest.Mocked<SessionService>;
    });

    it('GET /api/sessions should return 200 and list', async () => {
        const mockSessions = {
            data: [{ id: 1, content: 'Intro' }],
            pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        };

        (SessionService.prototype.getSessions as jest.Mock).mockResolvedValue(mockSessions);

        const response = await app.inject({
            method: 'GET',
            url: '/api/sessions',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            ...mockSessions,
        });
    });

    it('GET /api/sessions/:id should return 200 and session details', async () => {
        const mockSession = { id: 1, content: 'Intro' };
        (SessionService.prototype.getSessionById as jest.Mock).mockResolvedValue(mockSession);

        const response = await app.inject({
            method: 'GET',
            url: '/api/sessions/1',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            data: mockSession,
        });
    });

    it('POST /api/sessions should return 200 and id', async () => {
        const newSession = { id: 1, content: 'Intro' };
        (SessionService.prototype.createSession as jest.Mock).mockResolvedValue(newSession);

        const response = await app.inject({
            method: 'POST',
            url: '/api/sessions',
            payload: {
                courseId: 1,
                session_date: '2023-01-01',
                start_time: '2023-01-01T09:00:00',
                end_time: '2023-01-01T12:00:00',
                teacherId: 1,
                content: 'Intro',
                creatorId: 1
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            id: 1,
        });
    });

    it('PUT /api/sessions/:id should return 200', async () => {
        (SessionService.prototype.updateSession as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'PUT',
            url: '/api/sessions/1',
            payload: { content: 'Updated' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });

    it('DELETE /api/sessions/:id should return 200', async () => {
        (SessionService.prototype.deleteSession as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'DELETE',
            url: '/api/sessions/1',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });
});
