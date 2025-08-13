# YouTube Channel ID Quick Finder

## 🎯 Finding FPL Harry & FPL Family Channel IDs

### Method 1: Browser Source Code
1. **Go to the channel page:**
   - FPL Harry: Search "FPL Harry" on YouTube
   - FPL Family: Search "FPL Family" on YouTube

2. **View page source:**
   - Right-click → "View page source" (or Ctrl+U / Cmd+U)

3. **Search for channel ID:**
   - Press Ctrl+F (Cmd+F on Mac)
   - Search for: `"channelId":"`
   - Copy the 24-character ID that follows (starts with `UC`)

### Method 2: Online Tool
1. **Use Channel ID Finder:**
   - Go to: `commentpicker.com/youtube-channel-id.php`
   - Paste the channel URL
   - Get the channel ID instantly

### Method 3: URL Method
1. **Check channel URL:**
   - Some channels show ID in URL: `youtube.com/channel/UCxxxxxxxxxxx`
   - If URL shows `/c/channelname` or `/user/username`, use Method 1 or 2

## 🎯 Common FPL YouTube Channels (Examples)

Here are some popular FPL channels and their IDs (verify these are current):

| Channel | Likely Channel ID | Status |
|---------|------------------|---------|
| FPL Harry | UC_xxxxxxxxxxxxxxxxxx | ⚙️ Verify |
| FPL Family | UC_xxxxxxxxxxxxxxxxxx | ⚙️ Verify |
| Let's Talk FPL | UCRQHXnKX5EqGp8YLxz8aFg | ✅ Example |
| FPL Focal | UCm6zxFHXhb8s7tWWQ0v2zTa | ✅ Example |

**Note:** Always verify current channel IDs as they can change.

## 🔧 Testing Your Channel IDs

After finding the IDs, test them:

```javascript
// Test URL format
https://www.youtube.com/feeds/videos.xml?channel_id=YOUR_CHANNEL_ID_HERE

// Example test in Apps Script
function testChannelFeed() {
  const channelId = 'UCxxxxxxxxxxxxxxxxxxxxxxx';
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  try {
    const response = UrlFetchApp.fetch(rssUrl);
    console.log('✅ Channel feed working!');
    console.log('Recent videos found:', response.getContentText().includes('<entry>'));
  } catch (error) {
    console.log('❌ Channel feed error:', error);
  }
}
```

## 🚨 Important Notes

- **Format:** Channel IDs always start with `UC` and are 24 characters long
- **Verification:** Always test the RSS feed URL before deploying
- **Updates:** Channel IDs rarely change, but verify if feeds stop working
- **Privacy:** Some channels may have RSS feeds disabled

## 🎯 What to Replace in Script

Replace these lines in `boetball-radar-extended.js`:

```javascript
// BEFORE (placeholders)
FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQ7PsKm7K_yt9cLzqvEyY1A',
FPL_FAMILY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqKYKf4p-XKWBTaROmcD6sw',

// AFTER (actual IDs)
FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=ACTUAL_FPL_HARRY_ID',
FPL_FAMILY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=ACTUAL_FPL_FAMILY_ID',
```

Once you have the correct channel IDs, your BoetBall Radar System will be ready to track these YouTube sources! 🎯
