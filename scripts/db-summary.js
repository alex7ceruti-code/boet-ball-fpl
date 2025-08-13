const { PrismaClient } = require('../src/generated/prisma');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const prisma = new PrismaClient();

async function getDatabaseSummary() {
  try {
    console.log('📊 Boet Ball Database Summary\n');
    console.log('='.repeat(40));

    // Get counts for all main tables
    const [
      userCount,
      preferencesCount,
      newsCount,
      adminCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.userPreferences.count(),
      prisma.newsArticle.count().catch(() => 0), // In case table doesn't exist yet
      prisma.adminUser.count().catch(() => 0)     // In case table doesn't exist yet
    ]);

    console.log(`👥 Users: ${userCount}`);
    console.log(`⚙️  User Preferences: ${preferencesCount}`);
    console.log(`📰 News Articles: ${newsCount}`);
    console.log(`🔐 Admin Users: ${adminCount}`);

    if (userCount > 0) {
      // Get latest users
      const latestUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: {
          name: true,
          email: true,
          createdAt: true
        }
      });

      console.log(`\n🆕 Latest User: ${latestUser.name} (${latestUser.email})`);
      console.log(`   Registered: ${latestUser.createdAt.toISOString()}`);

      // Get active users (logged in recently)
      const recentActiveCount = await prisma.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      console.log(`\n📈 Active Users (24h): ${recentActiveCount}`);

      // Subscription breakdown
      const subscriptionStats = await prisma.user.groupBy({
        by: ['subscriptionType'],
        _count: {
          subscriptionType: true
        }
      });

      console.log('\n💳 Subscription Breakdown:');
      subscriptionStats.forEach(stat => {
        console.log(`   ${stat.subscriptionType}: ${stat._count.subscriptionType}`);
      });

      // Marketing opt-in stats
      const marketingStats = await prisma.user.groupBy({
        by: ['marketingOptIn'],
        _count: {
          marketingOptIn: true
        }
      });

      console.log('\n📧 Marketing Opt-in:');
      marketingStats.forEach(stat => {
        console.log(`   ${stat.marketingOptIn ? 'Opted In' : 'Opted Out'}: ${stat._count.marketingOptIn}`);
      });
    }

    console.log('\n='.repeat(40));
    console.log(`🕐 Generated: ${new Date().toISOString()}`);

  } catch (error) {
    console.error('❌ Error generating summary:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getDatabaseSummary();
