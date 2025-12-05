import { PrismaClient, Session, Prisma } from '@prisma/client';

interface CreateSessionData {
    courseId: number;
    session_date: Date;
    start_time: Date;
    end_time: Date;
    teacherId: number;
    content?: string;
    creatorId: number;
}

interface SessionFilters {
    courseId?: number;
    start_date?: Date;
    end_date?: Date;
    status?: string;
    page?: number;
    limit?: number;
}

export class SessionService {
    constructor(private prisma: PrismaClient) { }

    async createSession(data: CreateSessionData): Promise<Session> {
        return this.prisma.session.create({
            data: {
                course_id: data.courseId,
                session_date: data.session_date,
                start_time: data.start_time,
                end_time: data.end_time,
                teacher_id: data.teacherId,
                content: data.content,
                created_by: data.creatorId,
                status: 'scheduled',
            },
        });
    }

    async getSessions(filters: SessionFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.SessionWhereInput = {};

        if (filters.courseId) {
            where.course_id = filters.courseId;
        }

        if (filters.start_date) {
            where.session_date = { gte: filters.start_date };
        }

        if (filters.end_date) {
            where.session_date = { ...where.session_date as Prisma.DateTimeFilter, lte: filters.end_date };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [sessions, total] = await Promise.all([
            this.prisma.session.findMany({
                where,
                skip,
                take: limit,
                orderBy: { session_date: 'asc' },
            }),
            this.prisma.session.count({ where }),
        ]);

        return {
            data: sessions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getSessionById(id: number) {
        const session = await this.prisma.session.findUnique({
            where: { id },
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

        if (!session) return null;

        return {
            ...session,
            course_name: session.course.name,
            teacher_name: session.teacher.name,
            // We can keep attendance_records structure or flatten it if needed, 
            // but API_SPEC shows it nested.
        };
    }

    async updateSession(id: number, data: Partial<CreateSessionData> & { status?: string }) {
        return this.prisma.session.update({
            where: { id },
            data: {
                session_date: data.session_date,
                start_time: data.start_time,
                end_time: data.end_time,
                teacher_id: data.teacherId,
                content: data.content,
                status: data.status,
            },
        });
    }

    async deleteSession(id: number) {
        return this.prisma.session.delete({
            where: { id },
        });
    }
}
