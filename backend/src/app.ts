import fastify from 'fastify';
import { authRoutes } from './routes/auth.routes';
import { userRoutes } from './routes/user.routes';
import courseRoutes from './routes/course.routes';
import sessionRoutes from './routes/session.routes';
import attendanceRoutes from './routes/attendance.routes';
import leaveRoutes from './routes/leave.routes';
import notificationRoutes from './routes/notification.routes';
import parentRoutes from './routes/parent.routes';
import { classGroupRoutes } from './routes/class_group.routes';

export function buildApp() {
    const app = fastify({
        logger: true
    });

    app.register(require('@fastify/cors'), {
        origin: true // Allow all origins for development
    });

    app.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    app.register(authRoutes, { prefix: '/api/auth' });
    app.register(userRoutes, { prefix: '/api/users' });
    app.register(courseRoutes, { prefix: '/api/courses' });
    app.register(sessionRoutes, { prefix: '/api/sessions' });
    app.register(attendanceRoutes, { prefix: '/api/attendance' });
    app.register(leaveRoutes, { prefix: '/api/leave' });
    app.register(notificationRoutes, { prefix: '/api/notifications' });
    app.register(parentRoutes, { prefix: '/api' });
    app.register(classGroupRoutes, { prefix: '/api/classes' });

    return app;
}
