# 🔧 DNS Setup Guide for boetball.co.za

## Exact DNS Records to Add

Add these **4 records** to your DNS provider for `boetball.co.za`:

### 1. MX Record (Mail Exchange)
```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: Auto (or 3600)
```

### 2. SPF Record (Sender Policy Framework)
```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: Auto (or 3600)
```

### 3. DKIM Record (DomainKeys Identified Mail)
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDcwmZPzZQVtcKRfAFJITOR+dxXh/KFwOZHhycCCAcZ/K7EobzgM/pLnIHUCdf/oQOeFGxm5X/lQs/z/3iTAr6iHvGCBPXohfLXgchdgFRqS5gIvAqhj6fWtcMH6GQbMyrVGV1MTYQ01qeyUdPpz28fAqhzNXOy0BliWRQ6G/hPwIDAQAB
TTL: Auto (or 3600)
```

### 4. DMARC Record (Domain-based Message Authentication)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto (or 3600)
```

## Common DNS Providers Instructions

### If using **Cloudflare**:
1. Go to your Cloudflare dashboard
2. Select your `boetball.co.za` domain
3. Go to **DNS** tab
4. Click **Add record** for each record above
5. Make sure Proxy is **OFF** (gray cloud) for all email records

### If using **Namecheap**:
1. Go to Domain List → Manage
2. Go to **Advanced DNS** tab
3. Click **Add New Record** for each record
4. Use the exact values above

### If using **GoDaddy**:
1. Go to DNS Management
2. Click **Add** for each record
3. Use the exact values above

### If using **Other providers**:
The process is similar - find your DNS management section and add these 4 records.

## Important Notes

- **Name/Host field**: Some providers require you to enter just the part before your domain
  - For `send.boetball.co.za` → enter `send`
  - For `resend._domainkey.boetball.co.za` → enter `resend._domainkey`
  - For `_dmarc.boetball.co.za` → enter `_dmarc`

- **TTL**: Use Auto or 3600 seconds (1 hour)

- **Priority**: Only needed for MX record (set to 10)

- **Propagation**: DNS changes take 5-60 minutes to propagate globally

## After Adding Records

Run the monitoring script to check when verification is complete:
```bash
node monitor-domain.js
```

## Troubleshooting

If verification fails after 1 hour:
1. Double-check all record values match exactly
2. Ensure no extra spaces in values
3. Check that TTL is set appropriately
4. Some providers need @ symbol for root domain records
