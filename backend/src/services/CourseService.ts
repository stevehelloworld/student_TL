import { PrismaClient, Course, Prisma } from '@prisma/client';

interface CreateCourseData {
    name: string;
    description?: string;
    level?: string;
    teacherId: number;
    classGroupId: number;
    creatorId: number;
    start_date?: Date;
    end_date?: Date;
}

interface CourseFilters {
    status?: string;
    teacherId?: number;
    search?: string;
    page?: number;
    limit?: number;
}

export class CourseService {
    constructor(private prisma: PrismaClient) { }

    async createCourse(data: CreateCourseData): Promise<Course> {
        return this.prisma.course.create({
            data: {
                name: data.name,
                description: data.description,
                level: data.level,
                teacher_id: data.teacherId,
                class_group_id: data.classGroupId,
                created_by: data.creatorId,
                start_date: data.start_date || new Date(),
                end_date: data.end_date || new Date(),
                status: 'draft',
            },
        });
    }

    async getCourses(filters: CourseFilters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;

        const where: Prisma.CourseWhereInput = {};

        if (filters.status) {
            where.status = filters.status;
        }

        if (filters.teacherId) {
            where.teacher_id = filters.teacherId;
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [courses, total] = await Promise.all([
            this.prisma.course.findMany({
                where,
                skip,
                take: limit,
            }),
            this.prisma.course.count({ where }),
        ]);

        return {
            data: courses,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getCourseById(id: number) {
        const course = await this.prisma.course.findUnique({
            where: { id },
            include: {
                teacher: { select: { name: true } },
                enrollments: {
                    include: {
                        student: {
                            select: { id: true, name: true, student_no: true, email: true }
                        }
                    }
                },
                sessions: true,
            },
        });

        if (!course) return null;

        // Transform to match API_SPEC but also provide data for frontend
        return {
            ...course,
            teacher_name: course.teacher?.name,
            students: course.enrollments.map(e => e.student),
            teacher: undefined,
            // Keep enrollments for frontend which needs status
            enrollments: course.enrollments,
        };
    }

    async updateCourse(id: number, data: Partial<CreateCourseData>) {
        return this.prisma.course.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                level: data.level,
                teacher_id: data.teacherId,
                start_date: data.start_date,
                end_date: data.end_date,
            },
        });
    }

    async enrollStudent(courseId: number, studentId: number, creatorId: number) {
        return this.prisma.enrollment.create({
            data: {
                course_id: courseId,
                student_id: studentId,
                status: 'active',
                created_by: creatorId,
            },
        });
    }

    async removeStudent(courseId: number, studentId: number) {
        return this.prisma.enrollment.deleteMany({
            where: {
                course_id: courseId,
                student_id: studentId,
            },
        });
    }
}
