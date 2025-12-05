import Fastify, { FastifyInstance } from 'fastify';
import parentRoutes from '../../routes/parent.routes';
import { ParentService } from '../../services/ParentService';
import { prisma } from '../../lib/prisma';

// Mock dependencies
jest.mock('../../services/ParentService');
jest.mock('../../lib/prisma', () => ({
    prisma: {
        studentParent: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('Parent Routes', () => {
    let app: FastifyInstance;
    let mockParentService: jest.Mocked<ParentService>;

    beforeAll(async () => {
        app = Fastify();
        app.register(parentRoutes, { prefix: '/api' });
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockParentService = new ParentService(prisma) as jest.Mocked<ParentService>;
    });

    it('GET /api/students/:studentId/parents should return 200 and list', async () => {
        const mockParents = [{ id: 1, parent_name: 'John' }];
        (ParentService.prototype.getParents as jest.Mock).mockResolvedValue(mockParents);

        const response = await app.inject({
            method: 'GET',
            url: '/api/students/1/parents',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            data: mockParents,
        });
    });

    it('POST /api/students/:studentId/parents should return 200 and id', async () => {
        (ParentService.prototype.addParent as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'POST',
            url: '/api/students/1/parents',
            payload: {
                parentName: 'John',
                relationship: 'Father',
            },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({
            success: true,
            id: 1,
        });
    });

    it('PUT /api/parents/:id should return 200', async () => {
        (ParentService.prototype.updateParent as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'PUT',
            url: '/api/parents/1',
            payload: { phone: '123' },
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });

    it('DELETE /api/parents/:id should return 200', async () => {
        (ParentService.prototype.deleteParent as jest.Mock).mockResolvedValue({ id: 1 });

        const response = await app.inject({
            method: 'DELETE',
            url: '/api/parents/1',
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.payload)).toEqual({ success: true });
    });
});
