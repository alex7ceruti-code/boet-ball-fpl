#!/usr/bin/env node

const { PrismaClient } = require('../src/generated/prisma');

async function makeAdmin() {
  const prisma = new PrismaClient();
  
  try {
    const email = process.argv[2];
    
    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/make-admin.js your-email@example.com');
      process.exit(1);
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('Make sure you have registered an account first at http://localhost:3000/auth/signup');
      process.exit(1);
    }

    // Check if user is already an admin
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { userId: user.id },
    });

    if (existingAdmin) {
      console.log(`✅ User "${email}" is already an admin with role: ${existingAdmin.role}`);
      console.log('You can now access the admin dashboard at http://localhost:3000/admin');
      return;
    }

    // Create admin user
    const adminUser = await prisma.adminUser.create({
      data: {
        userId: user.id,
        role: 'ADMIN', // Can create and edit articles, view analytics
        permissions: JSON.stringify({
          canCreateArticles: true,
          canEditAnyArticle: true,
          canDeleteArticles: true,
          canManageUsers: false,
          canViewAnalytics: true,
          canManageAdmins: false,
        }),
      },
    });

    console.log('🎉 Success! Admin access granted');
    console.log('');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${user.name || 'Not set'}`);
    console.log(`🔑 Admin Role: ${adminUser.role}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('1. Sign in to your account at http://localhost:3000/auth/signin');
    console.log('2. Navigate to the admin dashboard: http://localhost:3000/admin');
    console.log('3. Start creating articles!');
    console.log('');
    console.log('📖 For content guidelines and help, see: ADMIN_SETUP.md');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
