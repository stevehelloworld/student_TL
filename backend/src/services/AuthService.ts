import { PrismaClient, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthService {
    constructor(
        private prisma: PrismaClient,
        private jwtSecret: string
    ) { }

    async login(username: string, password: string): Promise<{ token: string; user: User }> {
        const user = await this.prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            console.log('AuthService: User not found for username:', username);
            throw new Error('Invalid credentials');
        }

        if (user.status !== 'active') {
            console.log('AuthService: User not active:', user.email);
            throw new Error('Account is not active');
        }

        const isValid = await bcrypt.compare(password, user.password);
        console.log('AuthService: Password valid?', isValid);

        if (!isValid) {
            console.log('AuthService: Password mismatch');
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                userId: user.id,
                username: user.username,
                role: user.role,
            },
            this.jwtSecret,
            { expiresIn: '1d' }
        );

        return { token, user };
    }
}
