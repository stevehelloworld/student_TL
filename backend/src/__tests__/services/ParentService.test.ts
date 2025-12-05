import { ParentService } from '../../services/ParentService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        studentParent: {
            create: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('ParentService', () => {
    let parentService: ParentService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        parentService = new ParentService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('addParent', () => {
        it('should add a parent for a student', async () => {
            const data = {
                studentId: 1,
                parentName: 'John Doe',
                relationship: 'Father',
                phone: '1234567890',
                isPrimary: true,
                createdBy: 1,
            };

            const createdParent = {
                id: 1,
                student_id: data.studentId,
                parent_name: data.parentName,
                relationship: data.relationship,
                phone: data.phone,
                is_primary: data.isPrimary,
                created_by: data.createdBy,
            };

            (mockPrisma.studentParent.create as jest.Mock).mockResolvedValue(createdParent);

            const result = await parentService.addParent(data);

            expect(mockPrisma.studentParent.create).toHaveBeenCalledWith({
                data: {
                    student_id: data.studentId,
                    parent_name: data.parentName,
                    relationship: data.relationship,
                    phone: data.phone,
                    is_primary: data.isPrimary,
                    created_by: data.createdBy,
                },
            });
            expect(result).toEqual(createdParent);
        });
    });

    describe('getParents', () => {
        it('should return parents for a student', async () => {
            const studentId = 1;
            const parents = [{ id: 1, parent_name: 'John Doe' }];

            (mockPrisma.studentParent.findMany as jest.Mock).mockResolvedValue(parents);

            const result = await parentService.getParents(studentId);

            expect(mockPrisma.studentParent.findMany).toHaveBeenCalledWith({
                where: { student_id: studentId },
            });
            expect(result).toEqual(parents);
        });
    });

    describe('updateParent', () => {
        it('should update parent details', async () => {
            const id = 1;
            const data = { phone: '0987654321', updatedBy: 1 };
            const updatedParent = { id, phone: data.phone, updated_by: data.updatedBy };

            (mockPrisma.studentParent.update as jest.Mock).mockResolvedValue(updatedParent);

            const result = await parentService.updateParent(id, data);

            expect(mockPrisma.studentParent.update).toHaveBeenCalledWith({
                where: { id },
                data: {
                    phone: data.phone,
                    updated_by: data.updatedBy,
                },
            });
            expect(result).toEqual(updatedParent);
        });
    });

    describe('deleteParent', () => {
        it('should delete a parent record', async () => {
            const id = 1;
            const deletedParent = { id };

            (mockPrisma.studentParent.delete as jest.Mock).mockResolvedValue(deletedParent);

            const result = await parentService.deleteParent(id);

            expect(mockPrisma.studentParent.delete).toHaveBeenCalledWith({
                where: { id },
            });
            expect(result).toEqual(deletedParent);
        });
    });
});
