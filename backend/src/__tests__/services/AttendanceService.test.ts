import { AttendanceService } from '../../services/AttendanceService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        attendanceRecord: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            upsert: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('AttendanceService', () => {
    let attendanceService: AttendanceService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        attendanceService = new AttendanceService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('markAttendance', () => {
        it('should mark attendance for a student', async () => {
            const attendanceData = {
                sessionId: 1,
                studentId: 1,
                status: 'present',
                note: 'On time',
                creatorId: 1,
            };

            const record = {
                id: 1,
                session_id: attendanceData.sessionId,
                student_id: attendanceData.studentId,
                status: attendanceData.status,
                note: attendanceData.note,
                created_by: attendanceData.creatorId,
            };

            (mockPrisma.attendanceRecord.upsert as jest.Mock).mockResolvedValue(record);

            const result = await attendanceService.markAttendance(attendanceData);

            expect(mockPrisma.attendanceRecord.upsert).toHaveBeenCalledWith({
                where: {
                    session_id_student_id: {
                        session_id: attendanceData.sessionId,
                        student_id: attendanceData.studentId,
                    },
                },
                update: {
                    status: attendanceData.status,
                    note: attendanceData.note,
                },
                create: {
                    session_id: attendanceData.sessionId,
                    student_id: attendanceData.studentId,
                    status: attendanceData.status,
                    note: attendanceData.note,
                    created_by: attendanceData.creatorId,
                },
            });
            expect(result).toEqual(record);
        });
    });

    describe('getAttendance', () => {
        it('should return paginated attendance records', async () => {
            const filters = { sessionId: 1, page: 1, limit: 10 };
            const records = [{ id: 1, status: 'present' }];
            const total = 1;

            (mockPrisma.attendanceRecord.findMany as jest.Mock).mockResolvedValue(records);
            (mockPrisma.attendanceRecord.count as jest.Mock).mockResolvedValue(total);

            const result = await attendanceService.getAttendance(filters);

            expect(mockPrisma.attendanceRecord.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ session_id: 1 }),
                skip: 0,
                take: 10,
                orderBy: { session: { session_date: 'desc' } },
                include: { session: true },
            }));
            expect(result).toEqual({
                data: records,
                pagination: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
    });

    describe('getStudentAttendance', () => {
        it('should return attendance for a specific student', async () => {
            const studentId = 1;
            const records = [{ id: 1, status: 'present' }];

            (mockPrisma.attendanceRecord.findMany as jest.Mock).mockResolvedValue(records);

            const result = await attendanceService.getStudentAttendance(studentId);

            expect(mockPrisma.attendanceRecord.findMany).toHaveBeenCalledWith({
                where: { student_id: studentId },
                orderBy: { session: { session_date: 'desc' } },
                include: { session: true },
            });
            expect(result).toEqual(records);
        });
    });
});
