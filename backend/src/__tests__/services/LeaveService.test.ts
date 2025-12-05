import { LeaveService } from '../../services/LeaveService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        leaveRequest: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('LeaveService', () => {
    let leaveService: LeaveService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        leaveService = new LeaveService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createLeaveRequest', () => {
        it('should create a leave request with sessions', async () => {
            const leaveData = {
                studentId: 1,
                courseId: 1,
                type: 'sick',
                reason: 'Flu',
                sessionIds: [1, 2],
            };

            const createdLeave = {
                id: 1,
                student_id: leaveData.studentId,
                course_id: leaveData.courseId,
                type: leaveData.type,
                reason: leaveData.reason,
                status: 'pending',
            };

            (mockPrisma.leaveRequest.create as jest.Mock).mockResolvedValue(createdLeave);

            const result = await leaveService.createLeaveRequest(leaveData);

            expect(mockPrisma.leaveRequest.create).toHaveBeenCalledWith({
                data: {
                    student_id: leaveData.studentId,
                    course_id: leaveData.courseId,
                    type: leaveData.type,
                    reason: leaveData.reason,
                    status: 'pending',
                    sessions: {
                        create: [
                            { session_id: 1 },
                            { session_id: 2 },
                        ],
                    },
                },
            });
            expect(result).toEqual(createdLeave);
        });
    });

    describe('getLeaveRequests', () => {
        it('should return paginated leave requests', async () => {
            const filters = { courseId: 1, page: 1, limit: 10 };
            const requests = [{ id: 1, status: 'pending' }];
            const total = 1;

            (mockPrisma.leaveRequest.findMany as jest.Mock).mockResolvedValue(requests);
            (mockPrisma.leaveRequest.count as jest.Mock).mockResolvedValue(total);

            const result = await leaveService.getLeaveRequests(filters);

            expect(mockPrisma.leaveRequest.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ course_id: 1 }),
                skip: 0,
                take: 10,
                include: {
                    student: true,
                    sessions: { include: { session: true } },
                },
            }));
            expect(result).toEqual({
                data: requests,
                pagination: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
    });

    describe('updateLeaveStatus', () => {
        it('should update leave status', async () => {
            const id = 1;
            const status = 'approved';
            const reviewerId = 2;
            const updatedLeave = { id, status, approved_by: reviewerId };

            (mockPrisma.leaveRequest.update as jest.Mock).mockResolvedValue(updatedLeave);

            const result = await leaveService.updateLeaveStatus(id, status, reviewerId);

            expect(mockPrisma.leaveRequest.update).toHaveBeenCalledWith({
                where: { id },
                data: {
                    status,
                    approved_by: reviewerId,
                    approved_at: expect.any(Date),
                },
            });
            expect(result).toEqual(updatedLeave);
        });
    });
});
