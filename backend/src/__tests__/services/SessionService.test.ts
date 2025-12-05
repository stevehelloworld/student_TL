import { SessionService } from '../../services/SessionService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        session: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('SessionService', () => {
    let sessionService: SessionService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        sessionService = new SessionService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create a session', async () => {
            const sessionData = {
                courseId: 1,
                session_date: new Date('2023-01-01'),
                start_time: new Date('2023-01-01T09:00:00'),
                end_time: new Date('2023-01-01T12:00:00'),
                teacherId: 1,
                content: 'Intro',
                creatorId: 1,
            };

            const createdSession = {
                id: 1,
                course_id: sessionData.courseId,
                session_date: sessionData.session_date,
                start_time: sessionData.start_time,
                end_time: sessionData.end_time,
                teacher_id: sessionData.teacherId,
                content: sessionData.content,
                status: 'scheduled',
                created_by: sessionData.creatorId,
                created_at: new Date(),
                updated_at: new Date(),
            };

            (mockPrisma.session.create as jest.Mock).mockResolvedValue(createdSession);

            const result = await sessionService.createSession(sessionData);

            expect(mockPrisma.session.create).toHaveBeenCalledWith({
                data: {
                    course_id: sessionData.courseId,
                    session_date: sessionData.session_date,
                    start_time: sessionData.start_time,
                    end_time: sessionData.end_time,
                    teacher_id: sessionData.teacherId,
                    content: sessionData.content,
                    created_by: sessionData.creatorId,
                    status: 'scheduled',
                },
            });
            expect(result).toEqual(createdSession);
        });
    });

    describe('getSessions', () => {
        it('should return paginated sessions', async () => {
            const filters = { courseId: 1, page: 1, limit: 10 };
            const sessions = [{ id: 1, content: 'Intro' }];
            const total = 1;

            (mockPrisma.session.findMany as jest.Mock).mockResolvedValue(sessions);
            (mockPrisma.session.count as jest.Mock).mockResolvedValue(total);

            const result = await sessionService.getSessions(filters);

            expect(mockPrisma.session.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ course_id: 1 }),
                skip: 0,
                take: 10,
            }));
            expect(result).toEqual({
                data: sessions,
                pagination: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
    });

    describe('getSessionById', () => {
        it('should return session details', async () => {
            const sessionId = 1;
            const session = {
                id: sessionId,
                content: 'Intro',
                course: { name: 'Math' },
                teacher: { name: 'Teacher A' },
                attendance_records: []
            };

            (mockPrisma.session.findUnique as jest.Mock).mockResolvedValue(session);

            const result = await sessionService.getSessionById(sessionId);

            expect(mockPrisma.session.findUnique).toHaveBeenCalledWith({
                where: { id: sessionId },
                include: {
                    course: { select: { name: true } },
                    teacher: { select: { name: true } },
                    attendance_records: {
                        include: {
                            student: { select: { id: true, name: true } }
                        }
                    }
                },
            });
            expect(result).toEqual({
                ...session,
                course_name: 'Math',
                teacher_name: 'Teacher A',
            });
        });
    });

    describe('updateSession', () => {
        it('should update session', async () => {
            const sessionId = 1;
            const updateData = { content: 'Advanced' };

            (mockPrisma.session.update as jest.Mock).mockResolvedValue({ id: sessionId, ...updateData });

            const result = await sessionService.updateSession(sessionId, updateData);

            expect(mockPrisma.session.update).toHaveBeenCalledWith({
                where: { id: sessionId },
                data: updateData,
            });
            expect(result).toEqual({ id: sessionId, ...updateData });
        });
    });

    describe('deleteSession', () => {
        it('should delete session', async () => {
            const sessionId = 1;

            (mockPrisma.session.delete as jest.Mock).mockResolvedValue({ id: sessionId });

            await sessionService.deleteSession(sessionId);

            expect(mockPrisma.session.delete).toHaveBeenCalledWith({
                where: { id: sessionId },
            });
        });
    });
});
