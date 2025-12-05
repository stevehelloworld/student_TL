import { PrismaClient, ClassGroup, Prisma } from '@prisma/client';

interface CreateClassGroupData {
    name: string;
    academic_year: string;
    semester: string;
    status: string;
    created_by: number;
    class_teacher_id?: number;
    description?: string;
}

interface ClassGroupFilters {
    page?: number;
    limit?: number;
}

export class ClassGroupService {
    constructor(private prisma: PrismaClient) { }

    async createClassGroup(data: CreateClassGroupData): Promise<ClassGroup> {
        return this.prisma.classGroup.create({
            data,
        });
    }

    async getClassGroups(filters: ClassGroupFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const [classes, total] = await Promise.all([
            this.prisma.classGroup.findMany({
                skip,
                take: limit,
            }),
            this.prisma.classGroup.count(),
        ]);

        return {
            data: classes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async updateClassGroup(id: number, data: Partial<CreateClassGroupData>): Promise<ClassGroup> {
        return this.prisma.classGroup.update({
            where: { id },
            data,
        });
    }

    async deleteClassGroup(id: number): Promise<ClassGroup> {
        return this.prisma.classGroup.delete({
            where: { id },
        });
    }

    async getClassGroupById(id: number): Promise<ClassGroup | null> {
        return this.prisma.classGroup.findUnique({
            where: { id },
        });
    }
}
