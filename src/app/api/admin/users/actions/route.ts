import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const adminUser = await db.adminUser.findUnique({
      where: { userId: session.user.id }
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { action, userIds, data } = await request.json();

    switch (action) {
      case 'updateSubscription':
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: {
            subscriptionType: data.subscriptionType,
            subscriptionStart: data.subscriptionType === 'PREMIUM' ? new Date() : null,
            subscriptionEnd: data.subscriptionType === 'PREMIUM' 
              ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
              : null,
          }
        });
        break;

      case 'updateStatus':
        await db.user.updateMany({
          where: { id: { in: userIds } },
          data: { isActive: data.isActive }
        });
        break;

      case 'sendEmail':
        const users = await db.user.findMany({
          where: { id: { in: userIds } },
          select: { email: true, name: true }
        });

        for (const user of users) {
          try {
            await sendEmail({
              to: user.email,
              subject: data.subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background: linear-gradient(135deg, #007A3D 0%, #16a34a 100%); color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px;">Boet Ball FPL</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Message from Admin</p>
                  </div>
                  <div style="padding: 20px; background: #f9fafb;">
                    <p>Hi ${user.name || 'there'},</p>
                    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                      ${data.message}
                    </div>
                    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
                      Best regards,<br>
                      The Boet Ball FPL Team 🇿🇦
                    </p>
                  </div>
                </div>
              `
            });
          } catch (emailError) {
            console.error(`Failed to send email to ${user.email}:`, emailError);
          }
        }
        break;

      case 'deleteUsers':
        // Only SUPER_ADMIN can delete users
        if (adminUser.role !== 'SUPER_ADMIN') {
          return NextResponse.json(
            { error: 'Super admin access required for user deletion' },
            { status: 403 }
          );
        }

        // Delete user data in correct order due to foreign key constraints
        await db.$transaction(async (tx) => {
          // Delete related data first
          await tx.userAnalytics.deleteMany({ where: { userId: { in: userIds } } });
          await tx.newsAnalytics.deleteMany({ where: { userId: { in: userIds } } });
          await tx.userPreferences.deleteMany({ where: { userId: { in: userIds } } });
          await tx.adminUser.deleteMany({ where: { userId: { in: userIds } } });
          await tx.session.deleteMany({ where: { userId: { in: userIds } } });
          await tx.account.deleteMany({ where: { userId: { in: userIds } } });
          
          // Finally delete users
          await tx.user.deleteMany({ where: { id: { in: userIds } } });
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Log the admin action
    await db.userAnalytics.create({
      data: {
        userId: session.user.id,
        page: 'admin',
        action: `admin_${action}`,
        metadata: JSON.stringify({
          targetUsers: userIds,
          actionData: data,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
