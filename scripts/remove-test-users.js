const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeTestUsers() {
  const emailsToRemove = [
    'al_ceruti@icloud.com',
    'alex7ceruti@gmail.com'
  ];

  try {
    console.log('🗑️  Removing test users...');
    
    for (const email of emailsToRemove) {
      console.log(`\nChecking for user: ${email}`);
      
      // Find the user first
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          preferences: true,
          articles: true,
          analytics: true
        }
      });

      if (!user) {
        console.log(`❌ User ${email} not found`);
        continue;
      }

      console.log(`✅ Found user: ${user.name} (${user.email})`);
      
      // Delete related records first (due to foreign key constraints)
      
      // Delete user preferences
      if (user.preferences) {
        await prisma.userPreferences.delete({
          where: { userId: user.id }
        });
        console.log('  🗑️  Deleted user preferences');
      }

      // Delete user articles (if any)
      if (user.articles && user.articles.length > 0) {
        await prisma.newsArticle.deleteMany({
          where: { authorId: user.id }
        });
        console.log(`  🗑️  Deleted ${user.articles.length} articles`);
      }

      // Delete user analytics (if any)
      if (user.analytics && user.analytics.length > 0) {
        await prisma.newsAnalytics.deleteMany({
          where: { userId: user.id }
        });
        console.log(`  🗑️  Deleted ${user.analytics.length} analytics records`);
      }

      // Delete accounts linked to this user (NextAuth)
      const accounts = await prisma.account.deleteMany({
        where: { userId: user.id }
      });
      if (accounts.count > 0) {
        console.log(`  🗑️  Deleted ${accounts.count} linked accounts`);
      }

      // Delete sessions linked to this user (NextAuth)
      const sessions = await prisma.session.deleteMany({
        where: { userId: user.id }
      });
      if (sessions.count > 0) {
        console.log(`  🗑️  Deleted ${sessions.count} sessions`);
      }

      // Finally, delete the user
      await prisma.user.delete({
        where: { id: user.id }
      });
      
      console.log(`✅ Successfully deleted user: ${email}`);
    }

    console.log('\n🎉 All test users removed successfully!');
    
  } catch (error) {
    console.error('❌ Error removing users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeTestUsers();
