# Registration System Setup Guide

This guide covers the enhanced registration system with email verification, Terms & Conditions, Privacy Policy, and promo code functionality.

## 🆕 New Features Added

### 1. Enhanced Registration Process
- ✅ Terms & Conditions acceptance (required)
- ✅ Privacy Policy compliance (POPIA)
- ✅ Email verification system
- ✅ Promo code support
- ✅ South African themed emails
- ✅ Mobile-friendly forms

### 2. Email Verification System
- ✅ Welcome emails with verification links
- ✅ 24-hour token expiration
- ✅ Resend verification emails
- ✅ Email verification page with SA branding

### 3. Legal Compliance
- ✅ POPIA-compliant privacy policy
- ✅ South African legal terms
- ✅ Terms acceptance tracking
- ✅ User rights management

## 📧 Email Service Setup

### Using Resend (Recommended)

1. **Sign up at [Resend](https://resend.com)**
2. **Get your API key** from the dashboard
3. **Set environment variable:**
   ```bash
   RESEND_API_KEY=re_YourApiKeyHere
   ```
4. **Domain verification** (optional for production):
   - Add your domain in Resend dashboard
   - Update email `from` address in `src/lib/email.ts`

### Email Templates

The system includes three email templates:
- **Welcome/Verification Email** - Sent after registration
- **Password Reset Email** - For password recovery
- **Verification Reminder** - For unverified accounts

## 🛠 Environment Variables

Add these to your production environment:

```bash
# Email Service (Resend)
RESEND_API_KEY=re_YourApiKeyHere

# App URLs (for email links)
NEXTAUTH_URL=https://your-domain.com

# Optional: Custom email domain
EMAIL_FROM_DOMAIN=noreply@yourdomain.com
```

## 📋 Database Setup

### 1. Push Schema Changes

The schema has been updated with new fields. Deploy with:

```bash
# Production
npx prisma migrate deploy

# Development
npx prisma db push
```

### 2. New Database Fields

**User table additions:**
- `emailVerificationToken` - Unique verification token
- `emailVerificationExpires` - Token expiration date
- `promoCodeUsed` - Track which promo code was used
- `termsAcceptedAt` - When terms were accepted
- `termsVersion` - Version of accepted terms

**New PromoCode table:**
- Complete promo code management system
- Usage tracking and limits
- Expiration dates and restrictions

## 🎟️ Promo Code Setup

### Creating Promo Codes

Use the provided script to create demo promo codes:

```bash
node scripts/create-promo-codes.js
```

**Available demo codes:**
- `EARLYBIRD` - 50% off (100 uses, 30 days)
- `BOETFPL2024` - 30-day free trial (500 uses, 60 days) 
- `SPRINGBOKS` - 25% off (200 uses, 45 days)

### Manual Promo Code Creation

```sql
INSERT INTO promo_codes (code, description, discountType, discountValue, maxUses, validUntil, isActive)
VALUES ('YOURCODE', 'Description', 'PERCENTAGE', 25, 100, '2024-12-31', true);
```

## 🎨 UI/UX Features

### Registration Form
- **Terms acceptance checkbox** (required)
- **Promo code field** (optional)
- **Marketing opt-in** (optional)
- **Real-time validation**
- **SA-themed styling**

### Email Verification
- **Branded verification emails**
- **User-friendly verification page**
- **Auto-redirect after verification**
- **Resend verification option**

### Legal Pages
- **Terms of Service** (`/terms`)
- **Privacy Policy** (`/privacy`)
- **POPIA compliant**
- **SA legal framework**

## 🔄 Registration Flow

1. **User fills registration form**
   - Must accept terms & conditions
   - Optional promo code entry
   - Optional marketing consent

2. **Server processes registration**
   - Validates promo code (if provided)
   - Creates user with verification token
   - Sends welcome/verification email

3. **Email verification**
   - User clicks email link
   - Token validated and user marked as verified
   - Auto-redirect to sign in

4. **Sign in and setup**
   - User signs in normally
   - Redirected to profile setup
   - Full access granted

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Set `RESEND_API_KEY` environment variable
- [ ] Set `NEXTAUTH_URL` to production domain
- [ ] Run database migration: `npx prisma migrate deploy`
- [ ] Test email delivery in staging
- [ ] Create initial promo codes
- [ ] Review Terms & Privacy Policy content

### Post-deployment
- [ ] Test full registration flow
- [ ] Verify email delivery
- [ ] Test promo code redemption
- [ ] Check legal page accessibility
- [ ] Monitor email bounce rates
- [ ] Set up promo code analytics

## 🔧 Customization

### Email Templates
Edit templates in `src/lib/email.ts`:
- Update branding colors
- Modify copy and messaging
- Add/remove features
- Change sender information

### Terms & Privacy
Update legal documents:
- `src/app/terms/page.tsx` - Terms of Service
- `src/app/privacy/page.tsx` - Privacy Policy
- Ensure compliance with local laws

### Promo Codes
Customize promo code system:
- Add new discount types in schema
- Implement usage restrictions
- Create admin interface
- Add analytics tracking

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Registration completion rate
- Email verification rate
- Promo code usage
- Terms acceptance rate
- Email delivery success

### Recommended Tools
- **Email analytics**: Resend dashboard
- **User analytics**: Your existing system
- **Error tracking**: Application logs
- **Performance**: Registration form completion time

## 🛡️ Security Considerations

### Data Protection
- Email verification tokens expire after 24 hours
- Promo codes have usage limits and expiration
- Terms acceptance is timestamped and versioned
- User data encrypted in transit and at rest

### Rate Limiting
Consider implementing rate limiting for:
- Registration attempts
- Email verification requests
- Promo code validation
- Terms/Privacy page access

## 📞 Support

### Common Issues
1. **Emails not delivering**: Check RESEND_API_KEY and domain verification
2. **Verification links broken**: Ensure NEXTAUTH_URL is correctly set
3. **Promo codes not working**: Check expiration and usage limits
4. **Terms not displaying**: Verify route accessibility

### User Support
Provide users with:
- Clear instructions for email verification
- Support contact for email issues
- FAQ for common registration problems
- Alternative verification methods if needed

---

## 🎉 Success!

Your enhanced registration system is now ready with:
- ✅ Professional email verification
- ✅ Legal compliance (POPIA)
- ✅ Promo code marketing system
- ✅ South African branding
- ✅ Mobile-optimized experience

Users can now register with confidence, verify their email, use promo codes, and enjoy a fully compliant and branded experience! 🇿🇦
