#!/usr/bin/env node

/**
 * Create Admin Users Script
 * 
 * This script creates admin users with different roles for content generation.
 * Run with: node scripts/create-admin-users.js
 */

const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

const adminUsers = [
  {
    name: 'Super Admin',
    email: 'admin@boetball.com',
    password: 'BoetBall2024Admin!', // Change this to a secure password
    role: 'SUPER_ADMIN',
    permissions: {
      canManageUsers: true,
      canManageContent: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canPublishNews: true,
      canDeleteNews: true,
      canManageAdmins: true
    }
  },
  {
    name: 'Alessandro Ceruti',
    email: 'alex9ceruti@gmail.com', // Your existing account
    password: null, // Don't change password for existing user
    role: 'SUPER_ADMIN',
    permissions: {
      canManageUsers: true,
      canManageContent: true,
      canViewAnalytics: true,
      canManageSettings: true,
      canPublishNews: true,
      canDeleteNews: true,
      canManageAdmins: true
    }
  },
  {
    name: 'Content Editor',
    email: 'editor@boetball.com',
    password: 'BoetBallEditor2024!',
    role: 'EDITOR',
    permissions: {
      canManageUsers: false,
      canManageContent: true,
      canViewAnalytics: true,
      canManageSettings: false,
      canPublishNews: true,
      canDeleteNews: false,
      canManageAdmins: false
    }
  },
  {
    name: 'FPL Writer Bot',
    email: 'writer@boetball.com',
    password: 'BoetBallWriter2024!',
    role: 'ADMIN',
    permissions: {
      canManageUsers: false,
      canManageContent: true,
      canViewAnalytics: false,
      canManageSettings: false,
      canPublishNews: false,
      canDeleteNews: false,
      canManageAdmins: false
    }
  }
];

async function createAdminUsers() {
  console.log('🚀 Creating admin users for Boet Ball...\n');

  for (const adminData of adminUsers) {
    try {
      console.log(`📝 Processing: ${adminData.name} (${adminData.email})`);
      
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: adminData.email },
        include: { adminUser: true }
      });

      if (user) {
        console.log(`   ✅ User already exists`);
        
        // Check if they're already an admin
        if (user.adminUser) {
          console.log(`   🔧 Updating admin role from ${user.adminUser.role} to ${adminData.role}`);
          
          // Update admin role and permissions
          await prisma.adminUser.update({
            where: { userId: user.id },
            data: {
              role: adminData.role,
              permissions: JSON.stringify(adminData.permissions)
            }
          });
        } else {
          console.log(`   🎉 Adding admin privileges`);
          
          // Create admin record for existing user
          await prisma.adminUser.create({
            data: {
              userId: user.id,
              role: adminData.role,
              permissions: JSON.stringify(adminData.permissions)
            }
          });
        }
      } else {
        // Create new user
        console.log(`   🆕 Creating new user account`);
        
        const hashedPassword = adminData.password 
          ? await bcrypt.hash(adminData.password, 12)
          : null;
        
        user = await prisma.user.create({
          data: {
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            subscriptionType: 'PREMIUM',
            isActive: true,
            marketingOptIn: true,
            preferences: {
              create: {
                slangIntensity: 'HEAVY',
                showAdvancedStats: true,
                emailNotifications: true
              }
            },
            adminUser: {
              create: {
                role: adminData.role,
                permissions: JSON.stringify(adminData.permissions)
              }
            }
          },
          include: {
            adminUser: true,
            preferences: true
          }
        });
        
        console.log(`   🎊 Created user with admin privileges`);
      }
      
      console.log(`   📋 Role: ${adminData.role}`);
      console.log(`   🔑 Permissions: ${Object.keys(adminData.permissions).filter(k => adminData.permissions[k]).join(', ')}`);
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Error creating ${adminData.email}:`, error.message);
      console.log('');
    }
  }

  // Display summary
  console.log('📊 Admin Users Summary:');
  console.log('========================');
  
  const existingAdminUsers = await prisma.adminUser.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          isActive: true
        }
      }
    }
  });

  existingAdminUsers.forEach(admin => {
    const permissions = JSON.parse(admin.permissions);
    const activePerms = Object.keys(permissions).filter(k => permissions[k]);
    
    console.log(`👤 ${admin.user.name} (${admin.user.email})`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   Status: ${admin.user.isActive ? 'Active' : 'Inactive'}`);
    console.log(`   Permissions: ${activePerms.length} granted`);
    console.log('');
  });

  console.log('🎉 Admin setup complete!');
  console.log('\n🔐 Login Credentials:');
  console.log('=====================');
  console.log('Super Admin: admin@boetball.com / BoetBall2024Admin!');
  console.log('Your Account: alex9ceruti@gmail.com / (your existing password)');
  console.log('Editor: editor@boetball.com / BoetBallEditor2024!');
  console.log('Writer Bot: writer@boetball.com / BoetBallWriter2024!');
  console.log('\n⚠️  Remember to change these passwords after first login!');
}

async function main() {
  try {
    await createAdminUsers();
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createAdminUsers };
