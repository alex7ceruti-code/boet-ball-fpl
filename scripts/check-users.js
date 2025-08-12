const { PrismaClient } = require('@prisma/client');

// Use the generated Prisma client from the proper path
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking registered users...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        subscriptionType: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        loginCount: true,
        marketingOptIn: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in the database.');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      
      users.forEach((user, index) => {
        console.log(`--- User ${index + 1} ---`);
        console.log(`ID: ${user.id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Subscription: ${user.subscriptionType}`);
        console.log(`Active: ${user.isActive}`);
        console.log(`Created: ${user.createdAt.toISOString()}`);
        console.log(`Last Login: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : 'Never'}`);
        console.log(`Login Count: ${user.loginCount || 0}`);
        console.log(`Marketing Opt-in: ${user.marketingOptIn}`);
        console.log('');
      });
    }

    // Check for user preferences
    const preferences = await prisma.userPreferences.findMany({
      select: {
        userId: true,
        theme: true,
        emailNotifications: true,
        pushNotifications: true,
      }
    });

    if (preferences.length > 0) {
      console.log(`📊 Found preferences for ${preferences.length} user(s):\n`);
      preferences.forEach((pref, index) => {
        console.log(`User ${pref.userId}: Theme=${pref.theme}, Email=${pref.emailNotifications}, Push=${pref.pushNotifications}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
