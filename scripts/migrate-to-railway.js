const { PrismaClient } = require('../src/generated/prisma');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local (Vercel)
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function migrateData() {
  try {
    console.log('🚀 Starting data migration from Vercel to Railway...\n');

    // Source database (Vercel)
    const sourcePrisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL // Vercel database
        }
      }
    });

    // Get Railway database URL from command line argument
    const railwayDatabaseUrl = process.argv[2];
    if (!railwayDatabaseUrl) {
      console.log('❌ Please provide Railway database URL as argument:');
      console.log('node scripts/migrate-to-railway.js "postgresql://user:pass@host:port/db"');
      return;
    }

    // Target database (Railway)
    const targetPrisma = new PrismaClient({
      datasources: {
        db: {
          url: railwayDatabaseUrl
        }
      }
    });

    console.log('📊 Fetching data from Vercel database...');

    // Fetch all data from Vercel
    const [users, preferences] = await Promise.all([
      sourcePrisma.user.findMany({
        orderBy: { createdAt: 'asc' }
      }),
      sourcePrisma.userPreferences.findMany()
    ]);

    console.log(`✅ Found ${users.length} users and ${preferences.length} preferences to migrate`);

    if (users.length === 0) {
      console.log('No data to migrate');
      return;
    }

    console.log('🔄 Creating users in Railway database...');

    // Migrate users first
    for (const user of users) {
      try {
        await targetPrisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
            password: user.password,
            subscriptionType: user.subscriptionType,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            loginCount: user.loginCount,
            marketingOptIn: user.marketingOptIn,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          }
        });
        console.log(`✅ Migrated user: ${user.email}`);
      } catch (error) {
        console.log(`⚠️  User ${user.email} might already exist, skipping...`);
      }
    }

    console.log('🔄 Creating user preferences in Railway database...');

    // Migrate preferences
    for (const pref of preferences) {
      try {
        await targetPrisma.userPreferences.create({
          data: {
            id: pref.id,
            userId: pref.userId,
            weeklyReports: pref.weeklyReports,
            transferReminders: pref.transferReminders,
            darkMode: pref.darkMode,
            compactView: pref.compactView,
            showAdvancedStats: pref.showAdvancedStats,
            slangIntensity: pref.slangIntensity,
            showSouthAfricanTime: pref.showSouthAfricanTime,
            createdAt: pref.createdAt,
            updatedAt: pref.updatedAt,
          }
        });
        console.log(`✅ Migrated preferences for user: ${pref.userId}`);
      } catch (error) {
        console.log(`⚠️  Preferences for ${pref.userId} might already exist, skipping...`);
      }
    }

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const [migratedUsers, migratedPrefs] = await Promise.all([
      targetPrisma.user.count(),
      targetPrisma.userPreferences.count()
    ]);

    console.log(`✅ Migration complete!`);
    console.log(`   Users: ${migratedUsers} migrated`);
    console.log(`   Preferences: ${migratedPrefs} migrated`);

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    // Disconnect from both databases
    await sourcePrisma.$disconnect();
    if (targetPrisma) await targetPrisma.$disconnect();
  }
}

migrateData();
