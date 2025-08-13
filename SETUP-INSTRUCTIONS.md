# BoetBall Content Radar - Quick Setup Guide

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create new sheet: "BoetBall Content Radar"
3. Import our sample data from `content-radar-tracker.csv` (optional)

### Step 2: Set up Apps Script
1. In your sheet: **Extensions** → **Apps Script**
2. Delete default code and paste entire contents from `/apps-script/Code.gs`
3. Save project as "BoetBall Content Radar"
4. Click **Save** (💾 icon)

### Step 3: Test the System
1. Click **Run** next to `testContentRadarSystem` function
2. Grant permissions when prompted (Google will ask for access)
3. Check your sheet - should see new "Content Radar" tab with sample entries

### Step 4: Set up Weekly Automation  
1. Click **Triggers** (⏰ clock icon) in Apps Script
2. **Add Trigger** → **runWeeklyContentRadarUpdate**
3. Set timing: **Weekly** → **Monday** → **6 AM** (SAST timezone)
4. Save trigger

✅ **Done!** Your system will now automatically update every Monday at 6 AM.

---

## 🔧 Configuration Options

Edit these in the `CONFIG` object at the top of the script:

```javascript
const CONFIG = {
  FPL_API_URL: 'https://fantasy.premierleague.com/api/bootstrap-static/',
  REDDIT_API_URL: 'https://www.reddit.com/r/FantasyPL/hot.json?limit=15',
  SHEET_NAME: 'Content Radar',
  UPDATE_INTERVAL_MS: 2000, // Rate limiting between API calls
  CLEANUP_DAYS: 14, // Auto-delete old entries after X days
  MIN_REDDIT_SCORE: 50 // Minimum upvotes to track Reddit posts
};
```

## 🇿🇦 SA Content Customization

Add more South African phrases by editing the `SA_CONTENT` object:

```javascript
const SA_CONTENT = {
  injury: [
    'Your custom SA phrase here',
    // Add more injury-related SA angles
  ],
  price: [
    'Your custom price change SA angle',
    // Add more price-related SA phrases
  ]
  // Add more categories as needed
};
```

## 📊 What Gets Tracked Automatically

### FPL Official API
- ✅ Injured/doubtful players (>5% ownership)
- ✅ Form players (high scores, low ownership)
- ✅ Price changes (≥£0.1m movement)
- ✅ News updates from official sources

### Reddit r/FantasyPL  
- ✅ Trending posts (>50 upvotes)
- ✅ FPL-relevant discussions
- ✅ Community sentiment shifts
- ✅ Transfer/captaincy debates

### Automatic SA Context
- ✅ SAST timing references
- ✅ Local cultural comparisons
- ✅ South African lifestyle context
- ✅ Braai/rugby/load shedding references

## 🛠️ Advanced Features

### Custom Triggers
Add these triggers for more frequent updates:

- **Daily price check**: `monitorPriceChanges` at 7 AM daily
- **Reddit pulse**: `updateRedditFPLData` every 6 hours
- **Breaking news**: `updateFPLOfficialData` every 2 hours

### Email Notifications
Uncomment and customize this in `runWeeklyContentRadarUpdate`:

```javascript
MailApp.sendEmail(
  'your-email@domain.com',
  'BoetBall Content Update',
  `Weekly radar updated with ${newEntriesCount} new insights`
);
```

### Content Calendar Integration
Add this function to sync with your content planning:

```javascript
function exportToContentCalendar() {
  // Export high-priority entries to another sheet
  // or integrate with Google Calendar
}
```

## 🔍 Monitoring & Maintenance

### Check Logs
1. In Apps Script: **Execution Transcript** 
2. Look for errors or successful update messages
3. Monitor API rate limits

### Sheet Maintenance
- Review and mark entries as "Published" after using them
- Add engagement scores for successful content
- Archive old manual entries periodically

### Performance Optimization
- Adjust `MIN_REDDIT_SCORE` if too many/few posts
- Modify `CLEANUP_DAYS` based on your content velocity  
- Add more player names to `PLAYER_POOL` for better detection

## 🆘 Troubleshooting

### Common Issues

**"Authorization required"**
- Re-run function and grant permissions
- Check Google account has access to sheet

**"No data appearing"**  
- Check execution logs for API errors
- Verify internet connectivity
- Test individual functions (`testContentRadarSystem`)

**"Too many API calls"**
- Increase `UPDATE_INTERVAL_MS` to 3000+
- Reduce `REDDIT_API_URL` limit parameter

**"Sheet not found"**
- Ensure sheet name matches `CONFIG.SHEET_NAME`
- Run `testContentRadarSystem` to auto-create sheet

### Support Resources
- Google Apps Script documentation
- FPL API documentation (unofficial)
- Reddit API rate limit guidelines

---

## 🎯 Success Metrics

After 2-3 weeks, you should see:

- 📈 **15-25 auto-generated entries per week**
- 🇿🇦 **Every entry has SA cultural context**
- 📝 **5-8 actionable content ideas weekly**
- 🚀 **Trending topics identified 1-2 days early**
- ⚡ **Zero manual data collection time**

## 🔄 Content Workflow

1. **Monday**: Automation runs, new entries populate
2. **Tuesday**: Review entries, mark priorities
3. **Wednesday**: Create 2-3 articles from top insights
4. **Thursday**: Publish content, track engagement
5. **Friday**: Update engagement scores in sheet
6. **Weekend**: Monitor for breaking FPL news

This system transforms FPL data monitoring from a daily chore into an automated content pipeline with authentic South African flavor! 🔥
