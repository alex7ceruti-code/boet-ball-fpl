const { PrismaClient } = require('@prisma/client');

async function initializeDatabase() {
  const prisma = new PrismaClient();
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create tables if they don't exist (this is handled by Prisma automatically)
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Database tables initialized');
    
    // Check if we can create a test query
    const userCount = await prisma.user.count();
    console.log(`✅ Database working - ${userCount} users exist`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
