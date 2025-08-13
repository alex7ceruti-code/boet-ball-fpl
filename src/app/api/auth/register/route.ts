import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { name, email, password, marketingOptIn, promoCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Validate and check promo code if provided
    let promoCodeUsed = null;
    if (promoCode && promoCode.trim()) {
      const validPromoCode = await db.promoCode.findFirst({
        where: {
          code: promoCode.trim().toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          OR: [
            { validUntil: null },
            { validUntil: { gte: new Date() } }
          ]
        },
      });

      if (validPromoCode && (validPromoCode.maxUses === null || validPromoCode.currentUses < validPromoCode.maxUses)) {
        promoCodeUsed = promoCode.trim().toUpperCase();
        // Increment usage count
        await db.promoCode.update({
          where: { id: validPromoCode.id },
          data: { currentUses: { increment: 1 } }
        });
      }
    }

    // Generate email verification token
    const verificationToken = crypto.randomUUID();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        marketingOptIn: marketingOptIn || false,
        subscriptionType: 'FREE',
        promoCodeUsed,
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        termsAcceptedAt: new Date(),
        termsVersion: '2024.12', // Current terms version
      },
    });

    // Create default preferences
    await db.userPreferences.create({
      data: {
        userId: user.id,
      },
    });

    // Send verification email if email service is available
    let emailSent = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const { sendWelcomeEmail } = await import('@/lib/email');
        const result = await sendWelcomeEmail(user.email, user.name || 'User', verificationToken);
        emailSent = result.success;
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Continue without failing the registration
      }
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: emailSent 
        ? 'Account created successfully! Please check your email to verify your account.' 
        : 'Account created successfully! Email verification is not configured.',
      emailSent,
      requiresVerification: true,
      verificationToken: emailSent ? verificationToken : null,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
