
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Ensure student exists (id=3 from seed)
    // Ensure course exists (id=1)
    // Create pending request
    const request = await prisma.leaveRequest.create({
        data: {
            student_id: 3,
            course_id: 1,
            type: 'sick',
            reason: 'Seeded Pending Request for UI Verify',
            status: 'pending',
            sessions: {
                create: [{ session_id: 1 }]
            }
        }
    });
    console.log('Created pending request:', request.id);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
