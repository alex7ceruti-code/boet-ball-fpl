# Boet Ball News Admin Setup Guide

## 🚀 Getting Started with Content Management

### 1. Making Yourself an Admin

To create content, you first need admin access. Run this command in your terminal:

```bash
cd /Users/alessandroceruti/boet-ball
node scripts/make-admin.js YOUR_EMAIL_HERE
```

Replace `YOUR_EMAIL_HERE` with the email address you used to register on the site.

### 2. Admin Access Levels

- **SUPER_ADMIN**: Full access to everything
- **ADMIN**: Can manage content and view analytics  
- **EDITOR**: Can create and edit articles (recommended for content creation)

### 3. Creating Your First Article

1. **Login** to your Boet Ball account
2. **Navigate** to `/admin` (http://localhost:3000/admin)
3. **Click** "Create Article" 
4. **Fill out** the article form with:
   - Title (required)
   - Subtitle (optional)
   - Content (required - full article text)
   - Excerpt (required - short summary)
   - Tags (select from FPL categories)
   - Premium status (free vs paid content)
   - Publish status (draft vs published)

### 4. Content Guidelines (Copyright Safe) 📝

✅ **Safe to Use:**
- Official FPL API data and statistics
- Your original analysis and opinions
- Public statistical websites (with attribution)
- Social media posts (with proper attribution)
- User-generated insights and discussions

❌ **Avoid:**
- Copying full articles from other FPL sites
- Using copyrighted images without permission
- Reproducing premium content from other platforms
- Plagiarizing analysis from other FPL creators

🎯 **Best Practices:**
- Always cite sources when referencing external data
- Focus on original analysis rather than copying content
- Create unique South African perspective and insights
- Use "According to [source]" or "Data from [source]" 
- Include disclaimers: "Analysis based on publicly available data"

### 5. Content Ideas for FPL Articles

**Weekly Content:**
- Gameweek Preview: "GW[X] Captain Picks - SA Style" 
- Player Analysis: "Is [Player] Worth It This Week?"
- Fixture Analysis: "Upcoming Fixtures Difficulty Rating"
- Transfer Tips: "3 Smart Transfers for This Gameweek"

**Strategic Content:**
- "Budget FPL Team Guide for South Africans"
- "Wildcard Strategy: When and How"
- "Captain Armband Psychology - Local Perspective"  
- "Differential Picks That Could Pay Off"

**South African Angle:**
- "FPL Through SA Eyes: Cultural Commentary"
- "Braai Chat: This Week's FPL Talking Points"
- "Local FPL Community Insights"
- "Premier League Players South Africans Love"

### 6. SEO and Engagement Tips

**Title Format:**
- Use numbers: "5 Essential FPL Tips for GW15"
- Ask questions: "Should You Captain Salah This Week?"
- Include current info: "GW15 Captain Picks & Analysis"

**Tags to Use:**
- `gameweek-preview`, `gameweek-review`
- `transfers`, `captaincy`, `strategy` 
- `player-analysis`, `fixtures`
- `sa-content`, `opinion`
- `wildcards`, `free-hit`, `bench-boost`

### 7. Using AI for Content Creation

**Safe AI Workflow:**
1. **Research** using FPL API data and public sources
2. **Generate** initial draft with AI (ChatGPT, Claude, etc.)
3. **Customize** with South African perspective and local flavor
4. **Fact-check** all statistics and claims
5. **Add** original insights and opinions
6. **Cite** any external sources used

**AI Prompt Example:**
```
Write an FPL gameweek preview article focusing on:
- Captain options for GW[X]  
- Key fixture analysis
- Transfer recommendations
- Include South African cultural references and slang
- Base analysis on [insert current player form/fixtures]
- Keep tone conversational and engaging
```

### 8. Managing Content

**Admin Dashboard Features:**
- View all articles (draft, published, archived)
- Edit existing content
- Monitor article performance (views, likes)
- Quick stats overview
- Filter by status and tags

**Publishing Workflow:**
1. Create as **DRAFT** first
2. Review and edit content
3. Add proper tags and SEO info
4. Set **PUBLISHED** when ready
5. Monitor performance in admin dashboard

### 9. Premium vs Free Content

**Free Content:** 
- Basic gameweek previews
- General FPL tips
- Community discussions
- Player form updates

**Premium Content:**
- Detailed statistical analysis
- Advanced transfer strategies  
- Exclusive insights and predictions
- Early access to weekly content

### 10. Technical Notes

**Image Usage:**
- Use royalty-free images from Unsplash, Pexels
- FPL official images are generally safe to use
- Player photos: use official Premier League resources
- Always include alt text for accessibility

**Article Structure:**
- Use clear headings (H2, H3)
- Keep paragraphs short (2-3 sentences)
- Include bullet points and lists
- Add call-to-actions ("What do you think?")

### 11. Getting Help

**For Content Questions:**
- Check FPL official website for latest rules
- Use FPL subreddit for community insights
- Follow reputable FPL analysts on Twitter

**For Technical Issues:**
- Admin dashboard not loading: Check browser console
- Article not saving: Check required fields
- Images not showing: Verify URL is accessible

### 12. Example Article Template

```markdown
# GW15 Captain Armband: Salah vs Haaland Showdown

## The Situation
Brief overview of the gameweek and key fixtures.

## Top Captain Options

### Mohamed Salah (Liverpool)
- Fixture: Liverpool vs [Opponent] (H)
- Form: [Recent performance]
- Why he's essential: [Analysis]

### Erling Haaland (Manchester City)  
- Fixture: Manchester City vs [Opponent] (A)
- Form: [Recent performance]
- The case for him: [Analysis]

## Dark Horse Options
- [Alternative captain with reasoning]

## Final Verdict
Personal recommendation with reasoning.

## Over to You, Boets!
What's your captain pick this week? Let us know in the comments!

---
*Analysis based on FPL API data and current form. Good luck!*
```

## Ready to Start Creating! 🚀

Follow the steps above to get admin access and start creating engaging FPL content with a unique South African twist. Remember to keep it original, cite your sources, and have fun with the local flavor!

For any questions or technical issues, refer to this guide or check the admin dashboard for help.
