# BoetBall Radar System - Enhanced Setup Guide

## 🏉 Overview
Your enhanced BoetBall Radar System now includes **7 premium FPL data sources** with authentic South African flair:

1. **Official FPL API** - Live gameweek and player data
2. **Reddit r/FantasyPL** - Community discussions
3. **Fantasy Football Scout RSS** - Expert analysis
4. **FPL Harry YouTube** - Popular FPL content creator
5. **FPL Statistics** - Price prediction intelligence
6. **FPL Family YouTube** - Family-friendly FPL content
7. **Mr Midas Reddit** - Proven FPL expert insights

## 🎯 Quick Setup (5 Minutes)

### Step 1: Get YouTube Channel IDs
You'll need to find the correct YouTube channel IDs for FPL Harry and FPL Family:

**Finding YouTube Channel IDs:**
1. Go to the YouTube channel page
2. View page source (Ctrl+U / Cmd+U)
3. Search for `"channelId":"` or `"externalId":"`
4. Copy the channel ID (format: `UCxxxxxxxxxxxxxxxxxx`)

**Alternative method:**
1. Use online tools like `commentpicker.com/youtube-channel-id.php`
2. Enter the channel URL
3. Get the channel ID

### Step 2: Update Channel IDs in Script
Replace these placeholders in the script:

```javascript
// Current placeholders - REPLACE THESE
FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCQ7PsKm7K_yt9cLzqvEyY1A',
FPL_FAMILY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCqKYKf4p-XKWBTaROmcD6sw',

// With actual channel IDs:
FPL_HARRY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=ACTUAL_FPL_HARRY_CHANNEL_ID',
FPL_FAMILY_RSS: 'https://www.youtube.com/feeds/videos.xml?channel_id=ACTUAL_FPL_FAMILY_CHANNEL_ID',
```

### Step 3: Google Sheets Setup

1. **Create New Google Sheet:**
   - Go to sheets.google.com
   - Create new spreadsheet
   - Name it "BoetBall Radar System"

2. **Open Apps Script:**
   - In your sheet: `Extensions > Apps Script`
   - Delete default code
   - Paste the enhanced script from `boetball-radar-extended.js`

3. **Save and Authorize:**
   - `Ctrl+S` to save
   - Click `Save project`
   - Run `setupBoetBallRadar()` once to initialize

4. **Set Up Triggers:**
   - Click `Triggers` (alarm clock icon)
   - `+ Add Trigger`
   - Choose function: `weeklyBoetBallUpdate`
   - Event source: `Time-driven`
   - Type: `Week timer`
   - Day: `Monday`
   - Time: `9am-10am`

## 🎯 Source-Specific Setup

### 1. Fantasy Football Scout
- **RSS Feed:** `https://www.fantasyfootballscout.co.uk/feed/`
- **Content:** Expert analysis, player recommendations
- **SA Angle:** Premium insights for serious SA FPL managers
- **Update Frequency:** Every 3 days
- ✅ Ready to use - no additional setup

### 2. FPL Harry (YouTube)
- **Channel:** Find FPL Harry's YouTube channel
- **Get Channel ID:** Use method above
- **Content:** Popular FPL videos, analysis
- **SA Angle:** Perfect weekend braai viewing
- **Update Frequency:** Every 5 days
- ⚙️ **Action Required:** Replace channel ID in script

### 3. FPL Statistics
- **API:** `https://fplstatistics.co.uk/Home/AjaxDataForAllPlayersTable`
- **Content:** Price change predictions, ownership stats
- **SA Angle:** Beat the price rises, get ahead of the bokkies
- **Rate Limiting:** Uses polite User-Agent header
- ✅ Ready to use - no additional setup

### 4. FPL Family (YouTube)
- **Channel:** Find FPL Family's YouTube channel
- **Get Channel ID:** Use method above
- **Content:** Family-friendly FPL content
- **SA Angle:** Great for whole SA FPL family
- **Update Frequency:** Every 5 days
- ⚙️ **Action Required:** Replace channel ID in script

### 5. Mr Midas (Reddit)
- **User RSS:** `https://www.reddit.com/user/MrMidas/submitted/.rss`
- **Content:** Proven expert FPL analysis
- **SA Angle:** Golden insights from FPL legend
- **Update Frequency:** Every 5 days
- ✅ Ready to use - no additional setup

## 🔧 Testing Individual Sources

Test each source individually before running full updates:

```javascript
// Test individual sources
testFantasyFootballScout()  // Test FFS RSS
testFPLHarry()             // Test FPL Harry YouTube
testFPLStatistics()        // Test price predictions
testFPLFamily()            // Test FPL Family YouTube  
testMrMidas()              // Test Mr Midas Reddit

// Test all sources
updateBoetBallRadar()      // Full system test
```

## 🎯 Advanced Configuration

### Custom Update Frequencies
```javascript
// Daily essentials (price changes + gameweek data)
dailyBoetBallUpdate()

// Weekly comprehensive (all sources)
weeklyBoetBallUpdate()
```

### South African Context Customization
```javascript
// Customize SA angles in SA_CONTEXT object
const SA_CONTEXT = {
  timeGreetings: ['Howzit', 'Boet', 'Sharp', 'Eish', 'Lekker'],
  actions: [
    'Perfect braai-time content',
    'Share with the bokkies',
    'Load-shedding friendly content',  // Add your own
    'School holidays FPL prep'
  ]
}
```

## 📊 Expected Output

Your sheet will populate with entries like:

| Date | Source | Content Type | Key Topic | Summary | Player Mentions | FPL Relevance | South African Angle | Suggested Actions |
|------|--------|-------------|-----------|---------|----------------|---------------|-------------------|------------------|
| 2024-08-13 | FPL Statistics | Price Predictions | Expected Price Rises | Players likely to rise: Salah, Haaland | Salah, Haaland | High - Price change intel | Beat the price rises - get ahead of the bokkies! | Create urgent transfer alert content for SA managers |
| 2024-08-13 | FPL Harry (YouTube) | Video Analysis | GW1 Captain Picks Analysis | FPL Harry video: Best Captain Choices for GW1 | Salah, Haaland | High - Popular FPL content | Perfect weekend braai viewing for SA FPL managers | Create SA-specific response or summary content |

## 🚨 Important Notes

### YouTube Channel IDs
- **Critical:** You MUST replace the placeholder channel IDs
- **Format:** Always starts with `UC` followed by 22 characters
- **Testing:** Run individual tests to verify feeds work

### Rate Limiting
- FPL Statistics: Includes polite User-Agent header
- YouTube RSS: No rate limiting
- Reddit RSS: No rate limiting
- Fantasy Football Scout: No rate limiting

### Error Handling
- All functions include try-catch blocks
- Errors logged to sheet with SA context
- Individual source failures don't break entire system

## 🎯 Next Steps

1. **Replace YouTube Channel IDs** (most important!)
2. **Run `setupBoetBallRadar()`** once
3. **Test individual sources** with test functions
4. **Set up weekly trigger** for automated updates
5. **Customize SA context** phrases for your brand
6. **Start creating content** based on radar insights!

## 📞 Support

If any source fails:
1. Check the individual test function
2. Verify URLs are still valid
3. Check console logs in Apps Script
4. Ensure proper authorization

Your BoetBall Radar System is now ready to track **7 premium FPL sources** with authentic South African flair! 🏉⚡

---
*Created for BoetBall - Where FPL meets SA culture! 🇿🇦*
