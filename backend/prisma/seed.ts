import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import { prisma } from '../src/lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            username: 'admin',
        },
        create: {
            email,
            username: 'admin',
            name: 'Admin User',
            password: hashedPassword,
            role: Role.admin,
            status: 'active',
        },
    });

    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: {
            password: hashedPassword,
            username: 'teacher',
        },
        create: {
            email: 'teacher@example.com',
            username: 'teacher',
            name: 'Teacher User',
            password: hashedPassword,
            role: Role.teacher,
            status: 'active',
        },
    });

    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: {
            password: hashedPassword,
            username: 'student',
        },
        create: {
            email: 'student@example.com',
            username: 'student',
            name: 'Student User',
            password: hashedPassword,
            role: Role.student,
            status: 'active',
            student_no: 'S12345',
        },
    });

    console.log({ admin, teacher, student });

    // Create ClassGroup
    const classGroup = await prisma.classGroup.create({
        data: {
            name: 'Class A',
            academic_year: '2025',
            semester: '1',
            status: 'active',
            created_by: admin.id,
            class_teacher_id: teacher.id
        }
    });

    // Create Course
    const course = await prisma.course.create({
        data: {
            name: 'Mathematics 101',
            description: 'Basic Mathematics',
            level: '1',
            class_group_id: classGroup.id,
            teacher_id: teacher.id,
            start_date: new Date(),
            end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: 'active',
            created_by: admin.id
        }
    });

    // Create Session
    const session = await prisma.session.create({
        data: {
            course_id: course.id,
            session_date: new Date(),
            start_time: new Date(), // This might need specific time formatting if using Time type, but Prisma handles Date maps
            end_time: new Date(),
            teacher_id: teacher.id,
            status: 'scheduled',
            created_by: admin.id
        }
    });

    // Enrollment
    await prisma.enrollment.create({
        data: {
            course_id: course.id,
            student_id: student.id,
            status: 'active',
            created_by: admin.id
        }
    });

    // Attendance
    await prisma.attendanceRecord.create({
        data: {
            session_id: session.id,
            student_id: student.id,
            status: 'present',
            created_by: teacher.id
        }
    });

    console.log("Seeded Classes, Courses, Sessions, Enrollments");

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
