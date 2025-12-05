import { prisma } from './src/lib/prisma';
import { AuthService } from './src/services/AuthService';
import dotenv from 'dotenv';

dotenv.config();

const authService = new AuthService(prisma, process.env.JWT_SECRET || 'secret');

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';

    console.log(`Attempting login for ${email} with password ${password}`);

    try {
        const result = await authService.login(email, password);
        console.log('Login successful!');
        console.log('User:', result.user);
        console.log('Token:', result.token);
    } catch (error: any) {
        console.error('Login failed:', error.message);

        // Debugging info
        const user = await prisma.user.findUnique({ where: { email } });
        if (user) {
            console.log('User found in DB:', user);
            const bcrypt = require('bcrypt');
            const match = await bcrypt.compare(password, user.password);
            console.log('Bcrypt compare result:', match);
        } else {
            console.log('User not found in DB');
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
