const { PrismaClient } = require('../src/generated/prisma');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function checkRecentActivity() {
  try {
    console.log('🔍 Checking recent user activity...\n');
    
    // Get users who logged in within the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const recentUsers = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          gte: yesterday
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
      },
      orderBy: {
        lastLoginAt: 'desc'
      }
    });

    if (recentUsers.length === 0) {
      console.log('❌ No users have logged in within the last 24 hours.');
    } else {
      console.log(`✅ Found ${recentUsers.length} user(s) who logged in recently:\n`);
      
      recentUsers.forEach((user, index) => {
        const timeSinceLogin = new Date() - new Date(user.lastLoginAt);
        const hours = Math.floor(timeSinceLogin / (1000 * 60 * 60));
        const minutes = Math.floor((timeSinceLogin % (1000 * 60 * 60)) / (1000 * 60));
        
        console.log(`--- Recent User ${index + 1} ---`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Last Login: ${user.lastLoginAt.toISOString()}`);
        console.log(`Time Since Login: ${hours}h ${minutes}m ago`);
        console.log(`Total Logins: ${user.loginCount || 0}`);
        console.log(`Account Created: ${user.createdAt.toISOString()}`);
        console.log('');
      });
    }

    // Get registration statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const thisMonth = new Date(today);
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: today }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thisWeek }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: thisMonth }
        }
      }),
      prisma.user.count()
    ]);

    console.log('📊 Registration Statistics:');
    console.log(`Today: ${todayCount} new users`);
    console.log(`This week: ${weekCount} new users`);
    console.log(`This month: ${monthCount} new users`);
    console.log(`Total: ${totalCount} users`);

  } catch (error) {
    console.error('❌ Error checking recent activity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRecentActivity();
