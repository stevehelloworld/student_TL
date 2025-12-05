import { PrismaClient, AttendanceRecord, Prisma } from '@prisma/client';

interface MarkAttendanceData {
    sessionId: number;
    studentId: number;
    status: string;
    note?: string;
    creatorId: number;
}

interface AttendanceFilters {
    sessionId?: number;
    studentId?: number;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    page?: number;
    limit?: number;
}

export class AttendanceService {
    constructor(private prisma: PrismaClient) { }

    async markAttendance(data: MarkAttendanceData): Promise<AttendanceRecord> {
        return this.prisma.attendanceRecord.upsert({
            where: {
                session_id_student_id: {
                    session_id: data.sessionId,
                    student_id: data.studentId,
                },
            },
            update: {
                status: data.status,
                note: data.note,
            },
            create: {
                session_id: data.sessionId,
                student_id: data.studentId,
                status: data.status,
                note: data.note,
                created_by: data.creatorId,
            },
        });
    }

    async getAttendance(filters: AttendanceFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.AttendanceRecordWhereInput = {};

        if (filters.sessionId) {
            where.session_id = filters.sessionId;
        }

        if (filters.studentId) {
            where.student_id = filters.studentId;
        }

        if (filters.startDate) {
            where.session = { ...where.session as Prisma.SessionWhereInput, session_date: { gte: filters.startDate } };
        }

        if (filters.endDate) {
            const sessionWhere = where.session as Prisma.SessionWhereInput || {};
            const dateFilter = sessionWhere.session_date as Prisma.DateTimeFilter || {};

            where.session = {
                ...sessionWhere,
                session_date: { ...dateFilter, lte: filters.endDate }
            };
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [records, total] = await Promise.all([
            this.prisma.attendanceRecord.findMany({
                where,
                skip,
                take: limit,
                orderBy: { session: { session_date: 'desc' } },
                include: { session: true },
            }),
            this.prisma.attendanceRecord.count({ where }),
        ]);

        return {
            data: records,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getStudentAttendance(studentId: number, courseId?: number) {
        const where: Prisma.AttendanceRecordWhereInput = {
            student_id: studentId,
        };

        if (courseId) {
            where.session = { course_id: courseId };
        }

        return this.prisma.attendanceRecord.findMany({
            where,
            orderBy: { session: { session_date: 'desc' } },
            include: { session: true },
        });
    }
}
