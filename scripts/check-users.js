const { PrismaClient } = require('../src/generated/prisma');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

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
        weeklyReports: true,
        transferReminders: true,
        darkMode: true,
        compactView: true,
        showAdvancedStats: true,
        slangIntensity: true,
        showSouthAfricanTime: true,
      }
    });

    if (preferences.length > 0) {
      console.log(`📊 Found preferences for ${preferences.length} user(s):\n`);
      preferences.forEach((pref, index) => {
        console.log(`User ${pref.userId}:`);
        console.log(`  Weekly Reports: ${pref.weeklyReports}`);
        console.log(`  Transfer Reminders: ${pref.transferReminders}`);
        console.log(`  Dark Mode: ${pref.darkMode}`);
        console.log(`  Compact View: ${pref.compactView}`);
        console.log(`  Show Advanced Stats: ${pref.showAdvancedStats}`);
        console.log(`  Slang Intensity: ${pref.slangIntensity}`);
        console.log(`  Show SA Time: ${pref.showSouthAfricanTime}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
