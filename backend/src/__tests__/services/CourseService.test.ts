
import { CourseService } from '../../services/CourseService';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrisma = {
        course: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        enrollment: {
            create: jest.fn(),
            deleteMany: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('CourseService', () => {
    let courseService: CourseService;
    let mockPrisma: any;

    beforeEach(() => {
        mockPrisma = new PrismaClient();
        courseService = new CourseService(mockPrisma);
        jest.clearAllMocks();
    });

    describe('createCourse', () => {
        it('should create a course with valid data', async () => {
            const courseData = {
                name: 'Mathematics 101',
                description: 'Intro to Math',
                level: 'L1',
                teacherId: 1,
                classGroupId: 1,
                creatorId: 1,
            };

            const createdCourse = {
                id: 1,
                ...courseData,
                status: 'draft',
                start_date: null,
                end_date: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            (mockPrisma.course.create as jest.Mock).mockResolvedValue(createdCourse);

            const result = await courseService.createCourse(courseData);

            expect(mockPrisma.course.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: courseData.name,
                    description: courseData.description,
                    level: courseData.level,
                    teacher_id: courseData.teacherId,
                    class_group_id: courseData.classGroupId,
                    created_by: courseData.creatorId,
                    status: 'draft', // Default status check
                }),
            });
            expect(result).toEqual(createdCourse);
        });

        it('should allow setting start_date and end_date', async () => {
            const courseData = {
                name: 'Science',
                start_date: new Date('2023-01-01'),
                end_date: new Date('2023-06-30'),
                teacherId: 1,
                classGroupId: 1,
                creatorId: 1,
            };

            (mockPrisma.course.create as jest.Mock).mockResolvedValue({ id: 1, ...courseData, status: 'draft' });

            await courseService.createCourse(courseData);

            expect(mockPrisma.course.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    start_date: courseData.start_date,
                    end_date: courseData.end_date,
                }),
            });
        });
    });

    describe('getCourses', () => {
        it('should return paginated course list', async () => {
            const filters = { page: 1, limit: 10 };
            const courses = [{ id: 1, name: 'Math' }];
            const total = 1;

            (mockPrisma.course.findMany as jest.Mock).mockResolvedValue(courses);
            (mockPrisma.course.count as jest.Mock).mockResolvedValue(total);

            const result = await courseService.getCourses(filters);

            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
            }));
            expect(result).toEqual({
                data: courses,
                pagination: {
                    total,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            });
        });

        it('should filter by status', async () => {
            const filters = { status: 'active' };
            (mockPrisma.course.findMany as jest.Mock).mockResolvedValue([]);
            (mockPrisma.course.count as jest.Mock).mockResolvedValue(0);

            await courseService.getCourses(filters);

            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ status: 'active' }),
            }));
        });

        it('should filter by teacherId', async () => {
            const filters = { teacherId: 5 };
            (mockPrisma.course.findMany as jest.Mock).mockResolvedValue([]);
            (mockPrisma.course.count as jest.Mock).mockResolvedValue(0);

            await courseService.getCourses(filters);

            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ teacher_id: 5 }),
            }));
        });

        it('should search by name', async () => {
            const filters = { search: 'Math' };
            (mockPrisma.course.findMany as jest.Mock).mockResolvedValue([]);
            (mockPrisma.course.count as jest.Mock).mockResolvedValue(0);

            await courseService.getCourses(filters);

            expect(mockPrisma.course.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({
                    OR: [
                        { name: { contains: 'Math', mode: 'insensitive' } },
                        { description: { contains: 'Math', mode: 'insensitive' } },
                    ],
                }),
            }));
        });
    });

    describe('getCourseById', () => {
        it('should return course details with teacher name and students', async () => {
            const courseId = 1;
            const course = {
                id: courseId,
                name: 'Math',
                teacher: { name: 'Teacher A' },
                enrollments: [
                    { student: { id: 1, name: 'Student A', student_no: 'S001', email: 's1@example.com' } }
                ]
            };

            (mockPrisma.course.findUnique as jest.Mock).mockResolvedValue(course);

            const result = await courseService.getCourseById(courseId);

            expect(mockPrisma.course.findUnique).toHaveBeenCalledWith({
                where: { id: courseId },
                include: {
                    teacher: { select: { name: true } },
                    enrollments: {
                        include: {
                            student: {
                                select: { id: true, name: true, student_no: true, email: true }
                            }
                        }
                    }
                },
            });

            // Verify transformation matches API_SPEC structure
            expect(result).toEqual({
                id: courseId,
                name: 'Math',
                teacher_name: 'Teacher A',
                students: [
                    { id: 1, name: 'Student A', student_no: 'S001', email: 's1@example.com' }
                ]
            });
        });
    });

    describe('updateCourse', () => {
        it('should update a course', async () => {
            const updateData = { name: 'Advanced Math' };
            (mockPrisma.course.update as jest.Mock).mockResolvedValue({ id: 1, ...updateData });

            const result = await courseService.updateCourse(1, updateData);

            expect(mockPrisma.course.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining(updateData),
            });
            expect(result).toEqual({ id: 1, ...updateData });
        });
    });

    describe('enrollStudent', () => {
        it('should enroll a student in a course', async () => {
            const courseId = 1;
            const studentId = 1;
            const creatorId = 1;
            const enrollment = { id: 1, course_id: courseId, student_id: studentId, status: 'active', created_by: creatorId };

            (mockPrisma.enrollment.create as jest.Mock).mockResolvedValue(enrollment);

            const result = await courseService.enrollStudent(courseId, studentId, creatorId);

            expect(mockPrisma.enrollment.create).toHaveBeenCalledWith({
                data: {
                    course_id: courseId,
                    student_id: studentId,
                    status: 'active',
                    created_by: creatorId,
                },
            });
            expect(result).toEqual(enrollment);
        });
    });

    describe('removeStudent', () => {
        it('should remove a student from a course', async () => {
            const courseId = 1;
            const studentId = 1;

            (mockPrisma.enrollment.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

            await courseService.removeStudent(courseId, studentId);

            expect(mockPrisma.enrollment.deleteMany).toHaveBeenCalledWith({
                where: {
                    course_id: courseId,
                    student_id: studentId,
                },
            });
        });
    });
});
