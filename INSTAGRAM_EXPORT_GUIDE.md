# 📸 Instagram Image Export Feature - Usage Guide

## 🚀 Overview

Your Boet Ball FPL app now has a powerful Instagram image export feature that allows you to create high-quality, visually appealing images of your FPL analysis data that are perfect for sharing on social media.

## ✨ Features Included

### 📱 **Multiple Format Support**
- **Instagram Post** (1080×1080) - Perfect square format
- **Instagram Story** (1080×1920) - Vertical format  
- **Twitter Post** (1200×675) - Landscape format

### 🎨 **Template Variations**
- **Player Comparison** - Compare up to 4 players side by side
- **Player Spotlight** - Feature a single player with detailed stats
- **Captain Picks** - Top 3 captain recommendations with South African flair
- **Squad Analysis** - Full team breakdown with key statistics

### 🇿🇦 **South African Theming**
- Boet Ball branding with logo
- South African flag-inspired color schemes
- Local slang and terminology ("boet", "lekker", etc.)
- Professional visual design optimized for social media

## 🎯 How to Use

### **Method 1: From Player Comparison (Live Data)**

1. **Navigate to Players Database**
   ```
   Go to: http://localhost:3000/players
   ```

2. **Select Players**
   - Use checkboxes to select up to 4 players
   - Players appear in the comparison bar at the bottom

3. **Generate Image**
   - Click the "Share" button (camera icon) in the comparison bar
   - Choose your preferred format (Instagram Post, Story, or Twitter)
   - Preview the generated image
   - Click "Download Image" to save the high-resolution PNG

### **Method 2: Test Page (Sample Data)**

1. **Navigate to Test Page**
   ```
   Go to: http://localhost:3000/test-instagram
   ```

2. **Choose Template**
   - Player Comparison
   - Player Spotlight  
   - Captain Picks
   - Squad Analysis

3. **Generate & Download**
   - Select format and preview
   - Download high-quality image

## 📊 Template Details

### **Player Comparison Template**
- **Data**: Up to 4 players with stats, form, price, ownership
- **Layout**: 2×2 grid for Instagram posts, single column for stories
- **Colors**: Green gradient with white cards
- **Perfect for**: Transfer comparisons, player debates

### **Player Spotlight Template**
- **Data**: Single player with comprehensive stats
- **Layout**: Hero-style with large player name and key metrics
- **Colors**: Blue-purple gradient with accent colors
- **Perfect for**: Highlighting top performers, differential picks

### **Captain Picks Template**
- **Data**: Top 3 captain recommendations
- **Layout**: Numbered cards with South African flag colors
- **Colors**: Orange-red gradient with green/blue accents
- **Perfect for**: Gameweek captain advice

### **Squad Analysis Template**
- **Data**: Full squad stats (cost, points, form, top players)
- **Layout**: Key metrics grid + top performers list
- **Colors**: Green gradient with geometric patterns
- **Perfect for**: Team reviews, squad reveals

## 🔧 Technical Details

### **Image Quality**
- **Resolution**: 2x scale factor for crisp social media quality
- **Format**: PNG for best quality and transparency support
- **DPI**: High-resolution output suitable for professional posting

### **File Naming**
```
boet-ball-{template}-{timestamp}.png
```
Examples:
- `boet-ball-player-comparison-1724834567890.png`
- `boet-ball-captain-picks-1724834567890.png`

## 🎨 Visual Elements

### **Branding**
- Boet Ball logo prominently displayed
- Consistent color scheme across templates
- South African flag-inspired design elements

### **Typography**
- Bold, readable fonts optimized for mobile viewing
- Proper contrast ratios for accessibility
- Professional hierarchy and spacing

### **Layout Features**
- Responsive design that works across all formats
- Background patterns and geometric elements
- Proper spacing and visual balance

## 📱 Social Media Best Practices

### **Instagram Posts (1080×1080)**
- Perfect for feed posts
- Square format ensures full visibility
- Optimal for engagement and reach

### **Instagram Stories (1080×1920)**
- Full-screen vertical format
- Great for quick updates and highlights
- 24-hour temporary content

### **Twitter Posts (1200×675)**
- Landscape format for Twitter timeline
- Compact layout with essential information
- Easily shareable format

## 🔮 Future Enhancements

The image export system is designed to be extensible. Future templates could include:

- **Weekly Round-up** - Gameweek summary with top performers
- **Transfer Suggestions** - In/out recommendations
- **Fixture Analysis** - Team difficulty ratings
- **Mini-League Updates** - League standings and movements
- **Injury/News Updates** - Player status changes

## 🐛 Troubleshooting

### **Image Not Generating**
- Ensure you have players selected (for comparison templates)
- Check that html2canvas library is properly loaded
- Try refreshing the page and retrying

### **Low Image Quality**
- The system uses 2x scale factor by default
- Images should be crisp at 1080×1080 resolution
- If quality is poor, check browser compatibility

### **Layout Issues**
- Preview the image before downloading
- Try different formats to see which works best
- Templates are optimized for their respective formats

## 💡 Tips for Best Results

1. **Player Selection**: Choose players with contrasting stats for interesting comparisons
2. **Format Choice**: Use Instagram Post for most sharing, Story for quick updates
3. **Timing**: Generate images with current gameweek data for relevance
4. **Branding**: The Boet Ball branding helps establish your account identity
5. **Consistency**: Use the same template style for a cohesive social media presence

## 🎉 Ready to Share!

Your Instagram image export feature is now ready to help you create engaging, professional-looking FPL content that will stand out on social media. The South African theming and high-quality design will help build your Boet Ball community!

---

*Made with 🔥 for the South African FPL community*
