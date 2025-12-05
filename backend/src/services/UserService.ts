import { PrismaClient, User, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

export class UserService {
    constructor(private prisma: PrismaClient) { }

    async createUser(data: {
        name: string;
        username: string;
        email?: string;
        password: string;
        role: Role;
        creatorId?: number;
    }): Promise<User> {
        const { creatorId, ...userData } = data;

        if (userData.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: userData.username },
            });
            if (existingUser) {
                throw new Error('Username already exists');
            }
        }

        const hashedPassword = await bcrypt.hash(userData.password, 10);

        return this.prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                created_by: creatorId ?? undefined,
                status: 'active',
            },
        });
    }

    async getUsers(role?: Role) {
        const where: any = {};
        if (role) {
            where.role = role;
        }
        return this.prisma.user.findMany({
            where,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                status: true,
                created_at: true,
            }
        });
    }

    async updateUser(id: number, data: Partial<User>) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
