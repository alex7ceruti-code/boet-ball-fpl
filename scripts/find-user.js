const { PrismaClient } = require('../src/generated/prisma');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function findUser(searchTerm) {
  try {
    if (!searchTerm) {
      console.log('❌ Please provide a search term (email or user ID)');
      console.log('Usage: node scripts/find-user.js user@example.com');
      console.log('   or: node scripts/find-user.js cme8smfzn0000l204l5vpvmd4');
      return;
    }

    console.log(`🔍 Searching for user: ${searchTerm}\n`);

    // Try to find by email first, then by ID
    let user = await prisma.user.findUnique({
      where: { email: searchTerm },
      include: {
        preferences: true,
      }
    });

    if (!user) {
      // Try by ID
      user = await prisma.user.findUnique({
        where: { id: searchTerm },
        include: {
          preferences: true,
        }
      });
    }

    if (!user) {
      console.log(`❌ No user found with email or ID: ${searchTerm}`);
      return;
    }

    console.log('✅ User found:\n');
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Subscription: ${user.subscriptionType}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Created: ${user.createdAt.toISOString()}`);
    console.log(`Last Login: ${user.lastLoginAt ? user.lastLoginAt.toISOString() : 'Never'}`);
    console.log(`Login Count: ${user.loginCount || 0}`);
    console.log(`Marketing Opt-in: ${user.marketingOptIn}`);
    console.log(`Email Verified: ${user.emailVerified ? user.emailVerified.toISOString() : 'Not verified'}`);

    if (user.preferences) {
      console.log('\n📊 User Preferences:');
      console.log(`  Weekly Reports: ${user.preferences.weeklyReports}`);
      console.log(`  Transfer Reminders: ${user.preferences.transferReminders}`);
      console.log(`  Dark Mode: ${user.preferences.darkMode}`);
      console.log(`  Compact View: ${user.preferences.compactView}`);
      console.log(`  Show Advanced Stats: ${user.preferences.showAdvancedStats}`);
      console.log(`  Slang Intensity: ${user.preferences.slangIntensity}`);
      console.log(`  Show SA Time: ${user.preferences.showSouthAfricanTime}`);
    } else {
      console.log('\n❌ No preferences found for this user');
    }

    // Calculate account age
    const accountAge = new Date() - new Date(user.createdAt);
    const days = Math.floor(accountAge / (1000 * 60 * 60 * 24));
    const hours = Math.floor((accountAge % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    console.log(`\n⏰ Account Age: ${days} days, ${hours} hours`);

    if (user.lastLoginAt) {
      const timeSinceLogin = new Date() - new Date(user.lastLoginAt);
      const loginDays = Math.floor(timeSinceLogin / (1000 * 60 * 60 * 24));
      const loginHours = Math.floor((timeSinceLogin % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const loginMinutes = Math.floor((timeSinceLogin % (1000 * 60 * 60)) / (1000 * 60));
      
      if (loginDays > 0) {
        console.log(`🕐 Last seen: ${loginDays} days, ${loginHours} hours ago`);
      } else if (loginHours > 0) {
        console.log(`🕐 Last seen: ${loginHours} hours, ${loginMinutes} minutes ago`);
      } else {
        console.log(`🕐 Last seen: ${loginMinutes} minutes ago`);
      }
    }

  } catch (error) {
    console.error('❌ Error finding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get search term from command line arguments
const searchTerm = process.argv[2];
findUser(searchTerm);
