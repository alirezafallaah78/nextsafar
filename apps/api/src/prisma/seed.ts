import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. ساخت نقش‌ها
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'user' },
      update: {},
      create: { name: 'user', displayName: 'کاربر' },
    }),
    prisma.role.upsert({
      where: { name: 'support' },
      update: {},
      create: { name: 'support', displayName: 'پشتیبانی' },
    }),
    prisma.role.upsert({
      where: { name: 'admin' },
      update: {},
      create: { name: 'admin', displayName: 'مدیر' },
    }),
    prisma.role.upsert({
      where: { name: 'super_admin' },
      update: {},
      create: { name: 'super_admin', displayName: 'سوپر ادمین' },
    }),
  ]);

  console.log('✅ Roles created:', roles.map(r => r.name).join(', '));

  // 2. ساخت کاربران نمونه
  const passwordHash = await bcrypt.hash('Admin@12345', 10);

  const users = [
    {
      mobile: '09120000000',
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@nextsafar.ir',
      role: 'super_admin',
    },
    {
      mobile: '09121234567',
      firstName: 'علی',
      lastName: 'رضایی',
      email: 'ali@example.com',
      role: 'user',
    },
    {
      mobile: '09351112233',
      firstName: 'مریم',
      lastName: 'کریمی',
      role: 'user',
    },
    {
      mobile: '09903334455',
      firstName: 'حسین',
      lastName: 'موسوی',
      email: 'hossein@nextsafar.ir',
      role: 'support',
    },
    {
      mobile: '09127778899',
      firstName: 'زهرا',
      lastName: 'احمدی',
      email: 'zahra@nextsafar.ir',
      role: 'admin',
    },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { mobile: userData.mobile },
      update: {},
      create: {
        mobile: userData.mobile,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        passwordHash,
      },
    });

    const role = roles.find(r => r.name === userData.role);
    if (role) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: role.id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId: role.id,
        },
      });
    }
  }

  console.log('✅ Users created:', users.length);

  // 3. ساخت دسته‌بندی‌های تور با slug
  const categories = [
    { name: 'تفریحی', slug: 'recreational' },
    { name: 'زیارتی', slug: 'pilgrimage' },
    { name: 'ماجراجویی', slug: 'adventure' },
    { name: 'ماه عسل', slug: 'honeymoon' },
    { name: 'خانوادگی', slug: 'family' },
    { name: 'اقتصادی', slug: 'economy' },
    { name: 'لوکس', slug: 'luxury' },
  ];
  
  for (const cat of categories) {
    await prisma.tourCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    });
  }
  console.log('✅ Tour categories created:', categories.length);

  // 4. ساخت کشورهای ویزا
  const countries = [
    { name: 'ترکیه', code: 'TR' },
    { name: 'امارات', code: 'AE' },
    { name: 'گرجستان', code: 'GE' },
    { name: 'ارمنستان', code: 'AM' },
    { name: 'تایلند', code: 'TH' },
  ];
  for (const country of countries) {
    await prisma.visaCountry.upsert({
      where: { code: country.code },
      update: {},
      create: country,
    });
  }
  console.log('✅ Visa countries created:', countries.length);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
