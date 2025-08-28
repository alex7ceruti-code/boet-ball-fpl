require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminStatus() {
  try {
    console.log('🔍 Checking admin status for alex9ceruti@gmail.com...\n');
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: 'alex9ceruti@gmail.com'
      },
      include: {
        adminUser: true
      }
    });

    if (!user) {
      console.log('❌ User not found with email: alex9ceruti@gmail.com');
      console.log('\n📧 Let\'s check what users exist:');
      
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10
      });
      
      console.log('Recent users:');
      allUsers.forEach(u => {
        console.log(`  - ${u.email} (${u.name || 'No name'}) - ${u.createdAt}`);
      });
      return;
    }

    console.log(`✅ Found user: ${user.name || 'No name'} (${user.email})`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Subscription: ${user.subscriptionType}`);
    console.log(`   Active: ${user.isActive}`);
    
    if (user.adminUser) {
      console.log(`✅ Admin status: YES`);
      console.log(`   Role: ${user.adminUser.role}`);
      console.log(`   Permissions: ${user.adminUser.permissions}`);
    } else {
      console.log('❌ Admin status: NO');
      console.log('\n🔧 Creating admin user...');
      
      const adminUser = await prisma.adminUser.create({
        data: {
          userId: user.id,
          role: 'ADMIN',
          permissions: JSON.stringify(['FUT_CARDS', 'USER_MANAGEMENT', 'CONTENT_MANAGEMENT'])
        }
      });
      
      console.log('✅ Admin user created successfully!');
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Permissions: ${adminUser.permissions}`);
    }

  } catch (error) {
    console.error('❌ Error checking admin status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminStatus();
