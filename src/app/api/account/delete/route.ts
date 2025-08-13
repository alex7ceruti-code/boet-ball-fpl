import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { confirmation } = await request.json();

    // Require confirmation
    if (confirmation !== 'DELETE_ACCOUNT') {
      return NextResponse.json(
        { error: 'Invalid confirmation. Please type "DELETE_ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Start transaction to delete all user-related data
    await db.$transaction(async (prisma) => {
      // Delete user preferences
      await prisma.userPreferences.deleteMany({
        where: { userId }
      });

      // Delete user articles
      await prisma.newsArticle.deleteMany({
        where: { authorId: userId }
      });

      // Delete user analytics
      await prisma.newsAnalytics.deleteMany({
        where: { userId }
      });

      // Delete user accounts (OAuth connections)
      await prisma.account.deleteMany({
        where: { userId }
      });

      // Delete user sessions
      await prisma.session.deleteMany({
        where: { userId }
      });

      // Finally, delete the user
      await prisma.user.delete({
        where: { id: userId }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted'
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
