import { PrismaClient, LeaveRequest, Prisma } from '@prisma/client';

interface CreateLeaveRequestData {
    studentId: number;
    courseId: number;
    type: string;
    reason: string;
    sessionIds: number[];
}

interface LeaveFilters {
    courseId?: number;
    studentId?: number;
    status?: string;
    page?: number;
    limit?: number;
}

export class LeaveService {
    constructor(private prisma: PrismaClient) { }

    async createLeaveRequest(data: CreateLeaveRequestData): Promise<LeaveRequest> {
        return this.prisma.leaveRequest.create({
            data: {
                student_id: data.studentId,
                course_id: data.courseId,
                type: data.type,
                reason: data.reason,
                status: 'pending',
                sessions: {
                    create: data.sessionIds.map(sessionId => ({ session_id: sessionId })),
                },
            },
        });
    }

    async getLeaveRequests(filters: LeaveFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.LeaveRequestWhereInput = {};

        if (filters.courseId) {
            where.course_id = filters.courseId;
        }

        if (filters.studentId) {
            where.student_id = filters.studentId;
        }

        if (filters.status) {
            where.status = filters.status;
        }

        const [requests, total] = await Promise.all([
            this.prisma.leaveRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: {
                    student: true,
                    sessions: { include: { session: true } },
                },
            }),
            this.prisma.leaveRequest.count({ where }),
        ]);

        return {
            data: requests,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async updateLeaveStatus(id: number, status: string, reviewerId: number, rejectionReason?: string) {
        return this.prisma.leaveRequest.update({
            where: { id },
            data: {
                status,
                approved_by: reviewerId,
                approved_at: new Date(),
                rejection_reason: rejectionReason,
            },
        });
    }

    async getStudentLeaveRequests(studentId: number) {
        return this.prisma.leaveRequest.findMany({
            where: { student_id: studentId },
            orderBy: { created_at: 'desc' },
            include: {
                sessions: { include: { session: true } },
            },
        });
    }
}
