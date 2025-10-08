import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const PASSWORD = 'aksjdfh@19823843$';
async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash the password '123abc'
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(PASSWORD, saltRounds);

  // Create admin users
  const admins = [
    {
      name: 'Super Administrator',
      email: 'superadmin@rva.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN' as const, 
      permissions: [
        'USER_MANAGEMENT',
        'ADMIN_MANAGEMENT',
        'SYSTEM_SETTINGS',
        'VIEW_ANALYTICS',
        'MANAGE_TRADES',
        'MANAGE_DEPOSITS',
        'MANAGE_WITHDRAWALS',
        'MANAGE_KYC',
        'MANAGE_NOTIFICATIONS',
        'AUDIT_LOGS',
        'SECURITY_SETTINGS'
      ],
      department: 'System Administration',
      phone: '+1-555-0101'
    },
    {
      name: 'Admin Manager',
      email: 'admin@rva.com',
      password: hashedPassword,
      role: 'ADMIN' as const,
      permissions: [
        'USER_MANAGEMENT',
        'VIEW_ANALYTICS',
        'MANAGE_TRADES',
        'MANAGE_DEPOSITS',
        'MANAGE_WITHDRAWALS',
        'MANAGE_KYC',
        'MANAGE_NOTIFICATIONS'
      ],
      department: 'Operations',
      phone: '+1-555-0102'
    },
    {
      name: 'Support Specialist',
      email: 'support@rva.com',
      password: hashedPassword,
      role: 'SUPPORT' as const,
      permissions: [
        'USER_MANAGEMENT',
        'VIEW_ANALYTICS',
        'MANAGE_KYC'
      ],
      department: 'Customer Support',
      phone: '+1-555-0103'
    }
  ];

  console.log('👤 Creating admin users...');

  for (const adminData of admins) {
    try {
      const existingAdmin = await prisma.admin.findUnique({
        where: { email: adminData.email }
      });

      if (existingAdmin) {
        console.log(`   ⚠️  Admin with email ${adminData.email} already exists, skipping...`);
        continue;
      }

      const admin = await prisma.admin.create({
        data: adminData
      });

      console.log(`   ✅ Created admin: ${admin.name} (${admin.email}) with role ${admin.role}`);
    } catch (error) {
      console.error(`   ❌ Failed to create admin ${adminData.email}:`, error);
    }
  }

  console.log('🎉 Database seeding completed!');
  console.log('\n📋 Admin Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Email: superadmin@rva.com | Password: ${PASSWORD} | Role: SUPER_ADMIN');
  console.log('Email: admin@rva.com      | Password: ${PASSWORD} | Role: ADMIN');
  console.log('Email: support@rva.com    | Password: ${PASSWORD} | Role: SUPPORT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });