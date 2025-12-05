import { buildApp } from '../../app';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Mock Prisma
const prisma = new PrismaClient();

describe('Auth Routes', () => {
    let app: any;

    beforeAll(async () => {
        app = buildApp();
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('POST /api/auth/login', () => {
        it('should return token for valid credentials', async () => {
            const hashedPassword = await bcrypt.hash('password123', 10);
            const user = {
                id: 1,
                email: 'test@example.com',
                password: hashedPassword,
                role: 'student',
                status: 'active',
            };

            // Mock Prisma behavior
            // Note: Since we are mocking @prisma/client in the test file, 
            // any new PrismaClient() call in the app will return our mock.
            // We need to ensure the mock is set up correctly.
            const mockFindUnique = jest.fn().mockResolvedValue(user);

            // We need to override the PrismaClient implementation for this test
            // This is tricky with the current setup where PrismaClient is instantiated inside the route.
            // A better way is to pass prisma as a plugin option or use a singleton.
            // For now, let's try to rely on the module mock if we can set it up.
        });
    });
});

// We need to move the mock definition to the top level
jest.mock('@prisma/client', () => {
    const mPrisma = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});
