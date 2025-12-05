import { UserService } from '../../services/UserService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const prisma = new PrismaClient();
jest.mock('@prisma/client', () => {
    const mPrisma = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('UserService', () => {
    let userService: UserService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        userService = new UserService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        it('should create a user with hashed password', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'student' as const,
            };

            const createdUser = {
                id: 1,
                ...userData,
                password: 'hashed_password',
                status: 'pending',
                created_at: new Date(),
                updated_at: new Date(),
            };

            (mockPrisma.user.create as jest.Mock).mockResolvedValue(createdUser);

            const result = await userService.createUser(userData);

            expect(mockPrisma.user.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: userData.name,
                    email: userData.email,
                    role: userData.role,
                }),
            });
            expect(result).toEqual(createdUser);
            expect(result.password).not.toBe(userData.password);
        });

        it('should throw error if email already exists', async () => {
            const userData = {
                name: 'Test User',
                email: 'existing@example.com',
                password: 'password123',
                role: 'student' as const,
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 1, ...userData });
            (mockPrisma.user.create as jest.Mock).mockRejectedValue({
                code: 'P2002', // Prisma unique constraint error
            });

            await expect(userService.createUser(userData)).rejects.toThrow('Email already exists');
        });
    });
});
