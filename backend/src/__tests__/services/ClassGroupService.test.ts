import { ClassGroupService } from '../../services/ClassGroupService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const prisma = new PrismaClient();
jest.mock('@prisma/client', () => {
    const mPrisma = {
        classGroup: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('ClassGroupService', () => {
    let classGroupService: ClassGroupService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        classGroupService = new ClassGroupService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createClassGroup', () => {
        it('should create a class group with valid data', async () => {
            const classData = {
                name: 'Class 1A',
                academic_year: '2023',
                semester: '1',
                status: 'active',
                created_by: 1,
            };

            const createdClass = {
                id: 1,
                ...classData,
                class_teacher_id: null,
                description: null,
                updated_by: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            (mockPrisma.classGroup.create as jest.Mock).mockResolvedValue(createdClass);

            const result = await classGroupService.createClassGroup(classData);

            expect(mockPrisma.classGroup.create).toHaveBeenCalledWith({
                data: classData,
            });
            expect(result).toEqual(createdClass);
        });
    });

    describe('getClassGroups', () => {
        it('should return paginated class list', async () => {
            const filters = { page: 1, limit: 10 };
            const classes = [{ id: 1, name: 'Class 1A' }];
            const total = 1;

            (mockPrisma.classGroup.findMany as jest.Mock).mockResolvedValue(classes);
            (mockPrisma.classGroup.count as jest.Mock).mockResolvedValue(total);

            const result = await classGroupService.getClassGroups(filters);

            expect(mockPrisma.classGroup.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
            }));
            expect(result).toEqual({
                data: classes,
                pagination: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });
    });
});
