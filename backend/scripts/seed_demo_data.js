const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/student_db_202511';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding demo data...');

    // 0. Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { username: 'admin' },
        create: {
            name: 'Admin User',
            username: 'admin',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'admin',
            status: 'active'
        },
    });
    console.log('Admin created:', admin.email);

    // 1. Create Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@example.com' },
        update: { username: 'teacher' },
        create: {
            name: 'John Teacher',
            username: 'teacher',
            email: 'teacher@example.com',
            password: teacherPassword,
            role: 'teacher',
            status: 'active',
            created_by: admin.id
        },
    });
    console.log('Teacher created:', teacher.email);

    // 2. Create Student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
        where: { email: 'student@example.com' },
        update: { username: 'student1' },
        create: {
            name: 'Alice Student',
            username: 'student1',
            email: 'student@example.com',
            password: studentPassword,
            role: 'student',
            status: 'active',
            student_no: 'STU001',
            created_by: admin.id
        },
    });
    console.log('Student created:', student.email);

    // 3. Create Class Group
    const classGroup = await prisma.classGroup.create({
        data: {
            name: 'Class 1A',
            academic_year: '2025',
            semester: '1',
            status: 'active',
            created_by: teacher.id,
        },
    });
    console.log('Class Group created:', classGroup.name);

    // 4. Create Course
    const course = await prisma.course.create({
        data: {
            name: 'Mathematics 101',
            description: 'Introduction to Algebra',
            level: 'Beginner',
            start_date: new Date(),
            end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)),
            status: 'active',
            class_group_id: classGroup.id,
            teacher_id: teacher.id,
            created_by: teacher.id,
        },
    });
    console.log('Course created:', course.name);

    // 5. Create Session
    const session = await prisma.session.create({
        data: {
            course_id: course.id,
            session_date: new Date(),
            start_time: new Date(),
            end_time: new Date(new Date().setHours(new Date().getHours() + 1)),
            status: 'scheduled',
            teacher_id: teacher.id,
            created_by: teacher.id,
        },
    });
    console.log('Session created for course:', course.name);

    // 6. Enroll Student
    await prisma.enrollment.create({
        data: {
            course_id: course.id,
            student_id: student.id,
            status: 'active',
            created_by: teacher.id,
        },
    });
    console.log('Student enrolled in course');

    // 7. Create Notification
    await prisma.notification.create({
        data: {
            user_id: 1, // Admin
            title: 'System Update',
            content: 'The system has been updated successfully.',
            type: 'system',
        },
    });
    console.log('Notification created');

    console.log('Demo data seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
