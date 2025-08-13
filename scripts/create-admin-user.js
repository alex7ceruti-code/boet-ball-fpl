/**
 * Script to create an admin user for BoetBall
 * 
 * Usage:
 *   node scripts/create-admin-user.js <email> <password> [role]
 * 
 * Roles: SUPER_ADMIN, ADMIN, EDITOR, WRITER (default: ADMIN)
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser(email, password, role = 'ADMIN') {
  try {
    console.log('🔨 Creating admin user...\n');
    
    // Validate role
    const validRoles = ['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { adminUser: true },
    });

    if (existingUser) {
      if (existingUser.adminUser) {
        console.log(`✅ User ${email} already exists and is an admin with role: ${existingUser.adminUser.role}`);
        return;
      } else {
        console.log(`📝 User ${email} exists but is not an admin. Promoting to admin...`);
        
        // Create admin record for existing user
        await prisma.adminUser.create({
          data: {
            userId: existingUser.id,
            role,
            permissions: JSON.stringify({}),
          },
        });
        
        console.log(`✅ Successfully promoted ${email} to ${role}`);
        return;
      }
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and admin record in transaction
    console.log('👤 Creating user account...');
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0], // Use email prefix as default name
          isActive: true,
          subscriptionType: 'FREE',
          marketingOptIn: false,
        },
      });

      // Create admin record
      const adminUser = await tx.adminUser.create({
        data: {
          userId: user.id,
          role,
          permissions: JSON.stringify({}),
        },
      });

      return { user, adminUser };
    });

    console.log('\n🎉 Admin user created successfully!');
    console.log(`📧 Email: ${result.user.email}`);
    console.log(`👑 Role: ${result.adminUser.role}`);
    console.log(`🆔 User ID: ${result.user.id}`);
    console.log(`📅 Created: ${result.user.createdAt}`);
    
    console.log('\n🔗 You can now sign in at: https://boet-ball-fpl.vercel.app/auth/signin');

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node scripts/create-admin-user.js <email> <password> [role]');
  console.log('Roles: SUPER_ADMIN, ADMIN, EDITOR, WRITER (default: ADMIN)');
  process.exit(1);
}

const [email, password, role] = args;

// Validate email format
if (!email.includes('@')) {
  console.error('❌ Please provide a valid email address');
  process.exit(1);
}

// Validate password strength
if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters long');
  process.exit(1);
}

// Run the script
createAdminUser(email, password, role);
