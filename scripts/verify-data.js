const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  console.log('🔍 Verifying seeded data...\n');

  try {
    // Count users
    const userCount = await prisma.user.count({
      where: {
        email: {
          endsWith: '@example.com'
        }
      }
    });

    // Count KYC submissions
    const kycCount = await prisma.kycSubmission.count();

    // Get status distribution
    const statusDistribution = await prisma.kycSubmission.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    // Get level distribution
    const levelDistribution = await prisma.kycSubmission.groupBy({
      by: ['level'],
      _count: {
        level: true
      }
    });

    // Get recent submissions
    const recentSubmissions = await prisma.kycSubmission.findMany({
      take: 5,
      orderBy: {
        submittedAt: 'desc'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log('📊 Data Summary:');
    console.log(`Total Users (with @example.com emails): ${userCount}`);
    console.log(`Total KYC Submissions: ${kycCount}`);
    console.log('\n📈 Status Distribution:');
    statusDistribution.forEach(item => {
      console.log(`  ${item.status}: ${item._count.status}`);
    });

    console.log('\n📋 Level Distribution:');
    levelDistribution.forEach(item => {
      console.log(`  Level ${item.level}: ${item._count.level}`);
    });

    console.log('\n🕐 Recent Submissions:');
    recentSubmissions.forEach((submission, index) => {
      console.log(`  ${index + 1}. ${submission.user.firstName} ${submission.user.lastName} (${submission.user.email})`);
      console.log(`     Status: ${submission.status}, Level: ${submission.level}, Submitted: ${submission.submittedAt.toLocaleDateString()}`);
    });

    console.log('\n✅ Data verification complete!');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyData();