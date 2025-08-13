import { Resend } from 'resend';
import { getSlangPhrase, getSASlang } from '@/utils/slang';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
  
  try {
    const data = await resend.emails.send({
      from: 'Boet Ball FPL <noreply@boetball.co.za>',
      to: [email],
      subject: `🇿🇦 Welcome to the Boet Ball Family, ${name}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Boet Ball!</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #16a34a 0%, #059669 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="padding: 40px 30px; text-align: center; background: rgba(255,255,255,0.1);">
              <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">
                🔥
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">${getSASlang('greetings', 'hello')}, ${name}!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">Welcome to the Boet Ball Family! 🇿🇦</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 40px 30px; background: white;">
              <h2 style="color: #16a34a; margin: 0 0 20px; font-size: 22px;">Get Ready to Dominate Your FPL Season!</h2>
              
              <p style="margin: 0 0 20px; font-size: 16px;">
                ${getSASlang('culture', 'excitement')} You've just joined South Africa's most exciting FPL community! 
                We're here to help you climb those rankings with proper insights and a dash of local banter.
              </p>
              
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7d7 100%); padding: 25px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #92400e; margin: 0 0 15px; font-size: 18px;">🏆 What's waiting for you:</h3>
                <ul style="color: #92400e; margin: 0; padding-left: 20px;">
                  <li>Live FPL dashboard with SA flair</li>
                  <li>Smart fixture difficulty analysis</li>
                  <li>Team optimization suggestions</li>
                  <li>Mini league rivalry tracking</li>
                  <li>Weekly FPL tips & SA banter</li>
                </ul>
              </div>
              
              <!-- Verification Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #eab308 100%); 
                          color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(22,163,74,0.3);">
                  ✅ Verify Your Email & Start Winning
                </a>
              </div>
              
              <p style="margin: 25px 0; font-size: 14px; color: #666; text-align: center;">
                This verification link expires in 24 hours. Click above to get started!
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
                <p style="margin: 0; color: #475569; font-size: 14px;">
                  Need help? Reply to this email or visit our support center.<br>
                  <strong>Let's make this FPL season legendary! 🚀</strong>
                </p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="padding: 25px 30px; background: #1e293b; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 12px;">
                Boet Ball FPL Companion - Your South African FPL Edge<br>
                <a href="${process.env.NEXTAUTH_URL}/unsubscribe" style="color: #64748b;">Unsubscribe</a> | 
                <a href="${process.env.NEXTAUTH_URL}/privacy" style="color: #64748b;">Privacy Policy</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  resetToken: string
) => {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  try {
    const data = await resend.emails.send({
      from: 'Boet Ball FPL <noreply@boetball.co.za>',
      to: [email],
      subject: 'Reset Your Boet Ball Password 🔐',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #059669 100%);">
              <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Hi ${name}, let's get you back in the game!</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 16px;">
                Someone requested a password reset for your Boet Ball account. 
                If this was you, click the button below to create a new password.
              </p>
              
              <!-- Reset Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); 
                          color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(220,38,38,0.3);">
                  🔑 Reset My Password
                </a>
              </div>
              
              <p style="margin: 25px 0; font-size: 14px; color: #666; text-align: center;">
                This link expires in 1 hour for security reasons.
              </p>
              
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 25px 0;">
                <p style="margin: 0; color: #dc2626; font-size: 14px; font-weight: 500;">
                  ⚠️ If you didn't request this reset, please ignore this email. Your password won't change.
                </p>
              </div>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Password reset email failed:', error);
    return { success: false, error };
  }
};

export const sendEmailVerificationReminder = async (
  email: string,
  name: string,
  verificationToken: string
) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
  
  try {
    const data = await resend.emails.send({
      from: 'Boet Ball FPL <noreply@boetball.co.za>',
      to: [email],
      subject: `${getSASlang('greetings', 'hey')}, ${name}! Verify your email to unlock your FPL edge 🚀`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="padding: 30px; text-align: center; background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%);">
              <h1 style="color: white; margin: 0; font-size: 24px;">📧 Almost There, ${name}!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Just one quick step to unlock your FPL advantage</p>
            </div>
            
            <!-- Main Content -->
            <div style="padding: 30px;">
              <p style="margin: 0 0 20px; font-size: 16px;">
                ${getSASlang('time', 'hurry')} Your Boet Ball account is ready to go, but we need to verify your email first!
              </p>
              
              <!-- Verification Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #eab308 100%); 
                          color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; 
                          font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(22,163,74,0.3);">
                  ✅ Verify Email Now
                </a>
              </div>
              
              <p style="margin: 25px 0; font-size: 14px; color: #666; text-align: center;">
                This link expires soon, so ${getSASlang('time', 'now')}!
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Verification reminder email failed:', error);
    return { success: false, error };
  }
};

// Generic sendEmail function for admin emails
export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  try {
    const data = await resend.emails.send({
      from: 'Boet Ball FPL <noreply@boetball.co.za>',
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    console.log('Email sent successfully:', {
      to: options.to,
      subject: options.subject,
      messageId: data.data?.id
    });

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', {
      to: options.to,
      subject: options.subject,
      error
    });
    return { success: false, error };
  }
};
