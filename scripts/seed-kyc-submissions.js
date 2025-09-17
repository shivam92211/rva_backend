const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

// Sample data for generating dummy KYC submissions
const firstNames = [
  'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
  'William', 'Jennifer', 'James', 'Mary', 'Christopher', 'Patricia', 'Daniel',
  'Linda', 'Matthew', 'Barbara', 'Anthony', 'Susan', 'Mark', 'Jessica',
  'Donald', 'Karen', 'Steven', 'Nancy', 'Paul', 'Betty', 'Andrew', 'Helen'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
];

const nationalities = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'Japan', 'South Korea', 'Brazil', 'Mexico', 'India', 'China', 'Nigeria',
  'South Africa', 'Kenya', 'Ghana', 'Egypt', 'Morocco', 'Sweden', 'Norway'
];

const idTypes = ['passport', 'drivinglicense', 'idcard', 'bvn'];

const kycStatuses = ['PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'];

const rejectionReasons = [
  'Document quality is too poor',
  'Document is expired',
  'Document does not match personal information',
  'Selfie does not match ID photo',
  'Address proof is outdated',
  'Document appears to be tampered with'
];

// Helper function to generate random date within last 2 years
function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate random date of birth (18-80 years old)
function getRandomDateOfBirth() {
  const today = new Date();
  const minAge = 18;
  const maxAge = 80;
  const minYear = today.getFullYear() - maxAge;
  const maxYear = today.getFullYear() - minAge;

  return new Date(
    Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear,
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1
  );
}

// Helper function to generate random ID number
function generateIdNumber() {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
}

// Helper function to generate random phone number
function generatePhoneNumber() {
  return '+1' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
}

async function main() {
  console.log('🌱 Starting to seed KYC submissions...');

  // First, let's create some users if they don't exist
  const users = [];

  for (let i = 0; i < 30; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    try {
      const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
          phone: generatePhoneNumber(),
          isEmailVerified: Math.random() > 0.3, // 70% verified
          isPhoneVerified: Math.random() > 0.5, // 50% verified
          isActive: true,
        },
      });
      users.push(user);
      console.log(`✅ Created/found user: ${user.email}`);
    } catch (error) {
      console.error(`❌ Failed to create user ${email}:`, error);
    }
  }

  // Now create KYC submissions for these users
  const kycSubmissions = [];
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const now = new Date();

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const submittedAt = getRandomDate(twoYearsAgo, now);
    const status = kycStatuses[Math.floor(Math.random() * kycStatuses.length)];
    const isRejected = status === 'REJECTED';
    const isApproved = status === 'APPROVED';
    const isProcessing = status === 'PROCESSING';

    // Random level (1, 2, or 3)
    const level = Math.floor(Math.random() * 3) + 1;

    // Generate expire date for ID (1-10 years from now)
    const expireDate = new Date();
    expireDate.setFullYear(expireDate.getFullYear() + Math.floor(Math.random() * 10) + 1);

    try {
      const kycSubmission = await prisma.kycSubmission.create({
        data: {
          userId: user.id,
          level,
          status,
          firstName: user.firstName || firstNames[i % firstNames.length],
          lastName: user.lastName || lastNames[i % lastNames.length],
          dateOfBirth: getRandomDateOfBirth(),
          nationality: nationalities[Math.floor(Math.random() * nationalities.length)],
          idType: idTypes[Math.floor(Math.random() * idTypes.length)],
          idNumber: generateIdNumber(),
          idFrontImage: `https://example.com/kyc/${user.id}/id-front-${Date.now()}.jpg`,
          idBackImage: Math.random() > 0.3 ? `https://example.com/kyc/${user.id}/id-back-${Date.now()}.jpg` : null,
          selfieImage: `https://example.com/kyc/${user.id}/selfie-${Date.now()}.jpg`,
          addressProof: Math.random() > 0.4 ? `https://example.com/kyc/${user.id}/address-${Date.now()}.pdf` : null,
          utilityBill: Math.random() > 0.6 ? `https://example.com/kyc/${user.id}/utility-${Date.now()}.pdf` : null,
          expireDate: expireDate,
          submittedAt,
          reviewedAt: (isApproved || isRejected) ? getRandomDate(submittedAt, now) : null,
          reviewedBy: (isApproved || isRejected) ? `admin_${Math.floor(Math.random() * 5) + 1}` : null,
          rejectionReason: isRejected ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : null,
          rejectReason: isRejected ? rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)] : null,
          sentToKucoin: Math.random() > 0.3, // 70% sent to KuCoin
          sentAt: Math.random() > 0.3 ? getRandomDate(submittedAt, now) : null,
          kucoinSubmissionId: Math.random() > 0.3 ? `kucoin_${Date.now()}_${Math.random().toString(36).substring(7)}` : null,
          checkedAt: (isApproved || isRejected) ? getRandomDate(submittedAt, now) : null,
          errorMessage: (isRejected && Math.random() > 0.7) ? 'API timeout during submission' : null,
        },
      });

      kycSubmissions.push(kycSubmission);
      console.log(`✅ Created KYC submission for ${user.email} - Status: ${status}, Level: ${level}`);
    } catch (error) {
      console.error(`❌ Failed to create KYC submission for user ${user.email}:`, error);
    }
  }

  console.log(`\n🎉 Successfully created ${kycSubmissions.length} KYC submissions!`);
  console.log('\n📊 Summary:');

  // Generate summary statistics
  const statusCounts = kycSubmissions.reduce((acc, submission) => {
    acc[submission.status] = (acc[submission.status] || 0) + 1;
    return acc;
  }, {});

  const levelCounts = kycSubmissions.reduce((acc, submission) => {
    acc[`Level ${submission.level}`] = (acc[`Level ${submission.level}`] || 0) + 1;
    return acc;
  }, {});

  console.log('Status distribution:', statusCounts);
  console.log('Level distribution:', levelCounts);
  console.log(`Total submissions: ${kycSubmissions.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed.');
  });