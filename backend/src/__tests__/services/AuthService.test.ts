import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockPrisma = {
    user: {
        findUnique: jest.fn(),
    },
} as unknown as PrismaClient;

const mockUserService = {
    getUserByEmail: jest.fn(),
} as unknown as UserService;

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService(mockPrisma, 'secret_key');
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return token for valid credentials', async () => {
            const email = 'test@example.com';
            const password = 'password123';
            const user = {
                id: 1,
                email,
                password: 'hashed_password',
                role: 'student',
                status: 'active',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (jwt.sign as jest.Mock).mockReturnValue('mock_token');

            const result = await authService.login(email, password);

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { username: email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
            expect(result).toEqual({ token: 'mock_token', user });
        });

        it('should throw error for invalid password', async () => {
            const email = 'test@example.com';
            const password = 'wrong_password';
            const user = {
                id: 1,
                email,
                password: 'hashed_password',
                role: 'student',
                status: 'active',
            };

            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for non-existent user', async () => {
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(authService.login('unknown@example.com', 'password')).rejects.toThrow('Invalid credentials');
        });

        it('should throw error for inactive user', async () => {
            const user = {
                id: 1,
                email: 'inactive@example.com',
                password: 'hashed_password',
                role: 'student',
                status: 'inactive',
            };
            (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(user);

            await expect(authService.login(user.email, 'password')).rejects.toThrow('Account is not active');
        });
    });
});
