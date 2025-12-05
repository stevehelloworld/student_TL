import { PrismaClient, StudentParent } from '@prisma/client';

interface CreateParentData {
    studentId: number;
    parentName: string;
    relationship: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
    createdBy: number;
}

interface UpdateParentData {
    parentName?: string;
    relationship?: string;
    phone?: string;
    email?: string;
    isPrimary?: boolean;
    updatedBy: number;
}

export class ParentService {
    constructor(private prisma: PrismaClient) { }

    async addParent(data: CreateParentData): Promise<StudentParent> {
        return this.prisma.studentParent.create({
            data: {
                student_id: data.studentId,
                parent_name: data.parentName,
                relationship: data.relationship,
                phone: data.phone,
                email: data.email,
                is_primary: data.isPrimary,
                created_by: data.createdBy,
            },
        });
    }

    async getParents(studentId: number): Promise<StudentParent[]> {
        return this.prisma.studentParent.findMany({
            where: { student_id: studentId },
        });
    }

    async updateParent(id: number, data: UpdateParentData): Promise<StudentParent> {
        return this.prisma.studentParent.update({
            where: { id },
            data: {
                parent_name: data.parentName,
                relationship: data.relationship,
                phone: data.phone,
                email: data.email,
                is_primary: data.isPrimary,
                updated_by: data.updatedBy,
            },
        });
    }

    async deleteParent(id: number): Promise<StudentParent> {
        return this.prisma.studentParent.delete({
            where: { id },
        });
    }
}
