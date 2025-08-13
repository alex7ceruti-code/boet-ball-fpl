#!/usr/bin/env node

/**
 * Demo script to create promo codes
 * Run with: node scripts/create-promo-codes.js
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const promoCodes = [
  {
    code: 'EARLYBIRD',
    description: 'Early bird special for beta users',
    discountType: 'PERCENTAGE',
    discountValue: 50, // 50% off
    maxUses: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    newUsersOnly: true,
  },
  {
    code: 'BOETFPL2024',
    description: 'Special launch promo code',
    discountType: 'FREE_TRIAL',
    discountValue: 30, // 30 days
    maxUses: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    newUsersOnly: false,
  },
  {
    code: 'SPRINGBOKS',
    description: 'Rugby World Cup Champions special',
    discountType: 'PERCENTAGE',
    discountValue: 25, // 25% off
    maxUses: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    newUsersOnly: false,
  },
];

async function createPromoCodes() {
  console.log('🎟️ Creating promo codes...');
  
  try {
    for (const promoCode of promoCodes) {
      const existing = await db.promoCode.findUnique({
        where: { code: promoCode.code }
      });

      if (existing) {
        console.log(`⚠️  Promo code ${promoCode.code} already exists, skipping...`);
        continue;
      }

      const created = await db.promoCode.create({
        data: promoCode,
      });

      console.log(`✅ Created promo code: ${created.code} (${created.description})`);
    }

    console.log('\n🎉 Promo codes created successfully!');
    console.log('\nAvailable promo codes:');
    console.log('• EARLYBIRD - 50% off for early users (100 uses, 30 days)');
    console.log('• BOETFPL2024 - 30-day free trial (500 uses, 60 days)');
    console.log('• SPRINGBOKS - 25% off rugby special (200 uses, 45 days)');
  } catch (error) {
    console.error('❌ Error creating promo codes:', error);
  } finally {
    await db.$disconnect();
  }
}

createPromoCodes();
